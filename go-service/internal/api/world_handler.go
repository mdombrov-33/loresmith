package api

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/mdombrov-33/loresmith/go-service/gen/lorepb"
	"github.com/mdombrov-33/loresmith/go-service/internal/middleware"
	"github.com/mdombrov-33/loresmith/go-service/internal/store"
	"github.com/mdombrov-33/loresmith/go-service/internal/utils"
)

type WorldHandler struct {
	loreClient     lorepb.LoreServiceClient
	worldStore     store.WorldStore
	adventureStore store.AdventureStore
	portraitStore  *store.PortraitStore
	logger         *log.Logger
}

func NewWorldHandler(loreClient lorepb.LoreServiceClient, worldStore store.WorldStore, adventureStore store.AdventureStore, portraitStore *store.PortraitStore, logger *log.Logger) *WorldHandler {
	return &WorldHandler{
		loreClient:     loreClient,
		worldStore:     worldStore,
		adventureStore: adventureStore,
		portraitStore:  portraitStore,
		logger:         logger,
	}
}

func (h *WorldHandler) HandleCreateDraftWorld(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteResponseJSON(w, http.StatusMethodNotAllowed, utils.ResponseEnvelope{"error": "method not allowed"})
		return
	}

	currentUser := middleware.GetUser(r)

	// Accept deserialized format from frontend (details can have arrays/objects)
	var req struct {
		Pieces map[string]struct {
			Name        string         `json:"name"`
			Description string         `json:"description"`
			Details     map[string]any `json:"details"`
			Type        string         `json:"type"`
		} `json:"pieces"`
		Theme string `json:"theme"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid JSON body"})
		return
	}

	// Convert to gRPC format (serialize complex types to JSON strings)
	convertToGrpcPiece := func(piece struct {
		Name        string         `json:"name"`
		Description string         `json:"description"`
		Details     map[string]any `json:"details"`
		Type        string         `json:"type"`
	}) *lorepb.LorePiece {
		details := make(map[string]string)
		for key, value := range piece.Details {
			if v, ok := value.(string); ok {
				details[key] = v
			} else {
				// Serialize arrays/objects to JSON strings
				jsonBytes, _ := json.Marshal(value)
				details[key] = string(jsonBytes)
			}
		}
		return &lorepb.LorePiece{
			Name:        piece.Name,
			Description: piece.Description,
			Details:     details,
			Type:        piece.Type,
		}
	}

	var character, faction, setting, event, relic *lorepb.LorePiece
	if p, ok := req.Pieces["character"]; ok {
		character = convertToGrpcPiece(p)
	}
	if p, ok := req.Pieces["faction"]; ok {
		faction = convertToGrpcPiece(p)
	}
	if p, ok := req.Pieces["setting"]; ok {
		setting = convertToGrpcPiece(p)
	}
	if p, ok := req.Pieces["event"]; ok {
		event = convertToGrpcPiece(p)
	}
	if p, ok := req.Pieces["relic"]; ok {
		relic = convertToGrpcPiece(p)
	}

	grpcReq := &lorepb.FullStoryRequest{
		Pieces: &lorepb.SelectedLorePieces{
			Character: character,
			Faction:   faction,
			Setting:   setting,
			Event:     event,
			Relic:     relic,
		},
		Theme: req.Theme,
	}

	storyCtx, storyCancel := utils.NewGRPCContext(utils.OpGenerateFullStory)
	defer storyCancel()

	grpcResp, err := h.loreClient.GenerateFullStory(storyCtx, grpcReq)
	if err != nil {
		h.logger.Printf("ERROR: gRPC call for generating full story failed: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "failed to generate full story"})
		return
	}

	embeddingReq := &lorepb.EmbeddingRequest{
		Text: grpcResp.Story.Content,
	}

	embeddingCtx, embeddingCancel := utils.NewGRPCContext(utils.OpGenerateEmbedding)
	defer embeddingCancel()

	embeddingResp, err := h.loreClient.GenerateEmbedding(embeddingCtx, embeddingReq)
	if err != nil {
		h.logger.Printf("WARN: Failed to generate embedding, continuing without: %v", err)
		embeddingResp = nil
	}

	var embedding []float32
	if embeddingResp != nil && len(embeddingResp.Embedding) > 0 {
		embedding = embeddingResp.Embedding
		h.logger.Printf("INFO: Generated embedding with %d dimensions", len(embedding))
	}

	worldID, err := h.worldStore.CreateWorldWithEmbedding(int(currentUser.ID), req.Theme, grpcResp.Story, "draft", embedding)
	if err != nil {
		h.logger.Printf("ERROR: failed to save draft world: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "failed to save draft"})
		return
	}

	//* Upload character portraits to R2 with real world_id
	world, err := h.worldStore.GetWorldById(worldID)
	if err != nil {
		h.logger.Printf("WARN: Failed to get world for R2 upload: %v", err)
	} else if world != nil {
		h.logger.Printf("INFO: Retrieved world %d with %d lore pieces for R2 upload", worldID, len(world.LorePieces))
		for _, piece := range world.LorePieces {
			if piece.Type == "character" {
				uuid, ok := piece.Details["uuid"].(string)
				if !ok || uuid == "" {
					h.logger.Printf("WARN: Character %s has no UUID, skipping portrait upload", piece.Name)
					continue
				}

				portraitCtx, portraitCancel := context.WithTimeout(context.Background(), 5*time.Second)
				base64Data, err := h.portraitStore.GetPortrait(portraitCtx, uuid)
				portraitCancel()

				if err != nil {
					h.logger.Printf("ERROR: Failed to fetch portrait from Redis for %s (UUID: %s): %v", piece.Name, uuid, err)
					continue
				}

				if base64Data == "" {
					h.logger.Printf("WARN: Portrait not ready for %s (UUID: %s)", piece.Name, uuid)
					continue
				}

				uploadCtx, uploadCancel := utils.NewGRPCContext(utils.OpUploadImage)
				uploadResp, err := h.loreClient.UploadImageToR2(uploadCtx, &lorepb.UploadImageRequest{
					ImageBase64: base64Data,
					WorldId:     int64(worldID),
					CharacterId: strconv.Itoa(piece.ID),
					ImageType:   "portrait",
				})
				uploadCancel()

				if err != nil {
					h.logger.Printf("ERROR: Failed to upload portrait for %s: %v", piece.Name, err)
					continue
				}

				piece.Details["image_portrait"] = uploadResp.ImageUrl
				delete(piece.Details, "uuid")

				if err := h.worldStore.UpdateLorePieceDetails(piece.ID, piece.Details); err != nil {
					h.logger.Printf("ERROR: Failed to update lore piece: %v", err)
				} else {
					h.logger.Printf("INFO: Uploaded portrait for %s: %s", piece.Name, uploadResp.ImageUrl)
				}
			}
		}
	}

	utils.WriteResponseJSON(w, http.StatusCreated, utils.ResponseEnvelope{"world_id": worldID})
}

func (h *WorldHandler) HandleGetWorldById(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteResponseJSON(w, http.StatusMethodNotAllowed, utils.ResponseEnvelope{"error": "method not allowed"})
		return
	}

	worldIDStr := chi.URLParam(r, "id")
	worldID, err := strconv.Atoi(worldIDStr)
	if err != nil {
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid world ID"})
		return
	}

	world, err := h.worldStore.GetWorldById(worldID)
	if err != nil {
		h.logger.Printf("ERROR: failed to get world: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "failed to get world"})
		return
	}
	if world == nil {
		utils.WriteResponseJSON(w, http.StatusNotFound, utils.ResponseEnvelope{"error": "world not found"})
		return
	}

	//* Enrich active world with session count
	if world.Status == "active" {
		count, err := h.adventureStore.CountActiveSessions(world.ID)
		if err != nil {
			h.logger.Printf("WARNING: Failed to count sessions for world %d: %v", world.ID, err)
		} else {
			world.ActiveSessions = &count
		}
	}

	utils.WriteResponseJSON(w, http.StatusOK, utils.ResponseEnvelope{"world": world})
}

func (h *WorldHandler) HandleSearchWorlds(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteResponseJSON(w, http.StatusMethodNotAllowed, utils.ResponseEnvelope{"error": "method not allowed"})
		return
	}

	query := r.URL.Query()
	searchQuery := query.Get("q")

	if searchQuery == "" {
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "search query 'q' is required"})
		return
	}

	currentUser := middleware.GetUser(r)
	currentUserID := int(currentUser.ID)

	var userID *int
	var theme *string
	var status *string
	var scope string
	var limit int = 6
	var offset int = 0

	if scopeStr := query.Get("scope"); scopeStr != "" {
		scope = scopeStr
	} else {
		scope = "my"
	}

	switch scope {
	case "my":
		userID = &currentUserID
	case "global":
		//* userID remains nil for global
	default:
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid scope"})
		return
	}

	if themeStr := query.Get("theme"); themeStr != "" {
		theme = &themeStr
	}
	if statusStr := query.Get("status"); statusStr != "" && statusStr != "all" {
		status = &statusStr
	}

	if limitStr := query.Get("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}
	if offsetStr := query.Get("offset"); offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
			offset = o
		}
	}

	includeUserName := scope == "global"

	embeddingReq := &lorepb.EmbeddingRequest{
		Text: searchQuery,
	}

	searchEmbeddingCtx, searchEmbeddingCancel := utils.NewGRPCContext(utils.OpGenerateEmbedding)
	defer searchEmbeddingCancel()

	embeddingResp, err := h.loreClient.GenerateEmbedding(searchEmbeddingCtx, embeddingReq)
	if err != nil {
		h.logger.Printf("ERROR: failed to generate search embedding: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "failed to generate search embedding"})
		return
	}

	if len(embeddingResp.Embedding) == 0 {
		h.logger.Printf("ERROR: received empty embedding")
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "invalid embedding generated"})
		return
	}

	//* Handle search vs browsing
	var finalWorlds []*store.World
	var total int

	if searchQuery != "" {
		//* Search: get all worlds, rerank all, return all (frontend paginates)
		allWorlds, _, err := h.worldStore.SearchWorldsByEmbedding(embeddingResp.Embedding, userID, theme, status, includeUserName, currentUserID, 100, 0)
		if err != nil {
			h.logger.Printf("ERROR: failed to search all worlds: %v", err)
			utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "failed to search worlds"})
			return
		}

		rerankedWorlds := allWorlds
		if len(allWorlds) > 1 {
			rerankReq := &lorepb.RerankSearchRequest{
				Query:          searchQuery,
				Worlds:         utils.ConvertToWorldResults(allWorlds),
				QueryEmbedding: embeddingResp.Embedding,
			}

			rerankCtx, rerankCancel := utils.NewGRPCContext(utils.OpRerank)
			defer rerankCancel()

			rerankResp, err := h.loreClient.RerankResults(rerankCtx, rerankReq)
			if err != nil {
				h.logger.Printf("WARNING: reranking failed, using original results: %v", err)
			} else {
				rerankedWorlds = utils.ConvertFromWorldResults(rerankResp.RerankedWorlds, allWorlds)
			}
		}

		finalWorlds = rerankedWorlds
		total = len(rerankedWorlds)
	} else {
		//* Browsing: normal server-side pagination
		initialWorlds, totalCount, err := h.worldStore.SearchWorldsByEmbedding(embeddingResp.Embedding, userID, theme, status, includeUserName, currentUserID, limit, offset)
		if err != nil {
			h.logger.Printf("ERROR: failed to search worlds: %v", err)
			utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "failed to search worlds"})
			return
		}

		finalWorlds = initialWorlds
		total = totalCount
	}

	//* Count active sessions concurrently
	//* Goal: For each ACTIVE world, fetch its active session count in parallel
	//* Only active/published worlds can have sessions, so we skip draft worlds

	//* 1: Create a WaitGroup
	//* WaitGroup is a counter that tracks how many workers are still running
	var wg sync.WaitGroup

	//* 2: Loop through each world and start a goroutine for ACTIVE worlds only
	for i := range finalWorlds {
		//* Only enrich worlds that are in "active" status
		//* Draft worlds can't have active sessions, so skip them
		if finalWorlds[i].Status != "active" {
			continue
		}

		//* 2a: Tell the WaitGroup "we're starting 1 new worker"
		wg.Add(1)

		//* 2b: Launch a goroutine with the "go" keyword using an anonymous function
		//* We pass "i" and "finalWorlds[i]" as parameters to avoid closure issues
		go func(index int, world *store.World) {
			//* "defer wg.Done()" means when this function ends, tell WaitGroup this worker is done
			//* defer runs at the END of the function, no matter how it exits
			defer wg.Done()

			//* 3: Do the actual work - count active sessions for this world
			count, err := h.adventureStore.CountActiveSessions(world.ID)
			if err != nil {
				h.logger.Printf("WARNING: Failed to count sessions for world %d: %v", world.ID, err)
				return
			}

			//* 4: Store the result back in the world
			//* We use the index to modify the correct world in the slice
			finalWorlds[index].ActiveSessions = &count

		}(i, finalWorlds[i]) //* <-- These are the arguments passed to the anonymous function
		//*     We pass them explicitly to avoid the "loop variable capture" problem
	}

	//* 5: Wait for ALL goroutines to finish
	//* wg.Wait() blocks here until all goroutines call wg.Done()
	//* Once all are done, the program continues to the next line
	wg.Wait()

	utils.WriteResponseJSON(w, http.StatusOK, utils.ResponseEnvelope{
		"worlds": finalWorlds,
		"total":  total,
		"query":  searchQuery,
	})
}

func (h *WorldHandler) HandleGetWorldsByFilters(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteResponseJSON(w, http.StatusMethodNotAllowed, utils.ResponseEnvelope{"error": "method not allowed"})
		return
	}

	query := r.URL.Query()
	currentUser := middleware.GetUser(r)
	currentUserID := int(currentUser.ID)

	var userID *int
	var theme *string
	var status *string
	var sortBy *string
	var scope string
	var limit int = 6
	var offset int = 0

	if scopeStr := query.Get("scope"); scopeStr != "" {
		scope = scopeStr
	} else {
		scope = "my"
	}

	switch scope {
	case "my":
		userID = &currentUserID
	case "global":
		//* userID remains nil for global
	default:
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid scope"})
		return
	}

	if themeStr := query.Get("theme"); themeStr != "" {
		theme = &themeStr
	}
	if statusStr := query.Get("status"); statusStr != "" && statusStr != "all" {
		status = &statusStr
	}
	if sortByStr := query.Get("sort"); sortByStr != "" {
		sortBy = &sortByStr
	}

	if limitStr := query.Get("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}
	if offsetStr := query.Get("offset"); offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
			offset = o
		}
	}

	includeUserName := scope == "global"

	worlds, total, err := h.worldStore.GetWorldsByFilters(userID, theme, status, includeUserName, currentUserID, limit, offset, sortBy)
	if err != nil {
		h.logger.Printf("ERROR: failed to get worlds: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "failed to get worlds"})
		return
	}

	//* Enrich active worlds with their session counts in parallel
	var wg sync.WaitGroup

	for i := range worlds {
		//* Only enrich worlds that are in "active" status
		if worlds[i].Status != "active" {
			continue
		}

		wg.Add(1)

		go func(index int, world *store.World) {
			defer wg.Done()

			count, err := h.adventureStore.CountActiveSessions(world.ID)
			if err != nil {
				h.logger.Printf("WARNING: Failed to count sessions for world %d: %v", world.ID, err)
				return
			}

			worlds[index].ActiveSessions = &count
		}(i, worlds[i])
	}

	wg.Wait()

	utils.WriteResponseJSON(w, http.StatusOK, utils.ResponseEnvelope{
		"worlds": worlds,
		"total":  total,
	})
}

func (h *WorldHandler) HandleDeleteWorldById(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		utils.WriteResponseJSON(w, http.StatusMethodNotAllowed, utils.ResponseEnvelope{"error": "method not allowed"})
		return
	}

	worldIDStr := chi.URLParam(r, "id")
	worldID, err := strconv.Atoi(worldIDStr)
	if err != nil {
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid world ID"})
		return
	}

	err = h.worldStore.DeleteWorldById(worldID)
	if err != nil {
		h.logger.Printf("ERROR: failed to delete world: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "failed to delete world"})
		return
	}

	utils.WriteResponseJSON(w, http.StatusOK, utils.ResponseEnvelope{"message": "world deleted successfully"})
}

func (h *WorldHandler) HandleUpdateWorldVisibility(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		utils.WriteResponseJSON(w, http.StatusMethodNotAllowed, utils.ResponseEnvelope{"error": "method not allowed"})
		return
	}

	worldIDStr := chi.URLParam(r, "id")
	worldID, err := strconv.Atoi(worldIDStr)
	if err != nil {
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid world ID"})
		return
	}

	var req struct {
		Visibility string `json:"visibility"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid JSON body"})
		return
	}

	if req.Visibility != "private" && req.Visibility != "published" {
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "visibility must be 'private' or 'published'"})
		return
	}

	currentUser := middleware.GetUser(r)
	world, err := h.worldStore.GetWorldById(worldID)
	if err != nil {
		utils.WriteResponseJSON(w, http.StatusNotFound, utils.ResponseEnvelope{"error": "world not found"})
		return
	}

	if world.UserID != int(currentUser.ID) {
		utils.WriteResponseJSON(w, http.StatusForbidden, utils.ResponseEnvelope{"error": "not authorized to update this world"})
		return
	}

	err = h.worldStore.UpdateWorldVisibility(worldID, req.Visibility)
	if err != nil {
		h.logger.Printf("ERROR: failed to update world visibility: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "failed to update visibility"})
		return
	}

	utils.WriteResponseJSON(w, http.StatusOK, utils.ResponseEnvelope{"success": true, "visibility": req.Visibility})
}

func (h *WorldHandler) HandleRateWorld(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		utils.WriteResponseJSON(w, http.StatusMethodNotAllowed, utils.ResponseEnvelope{"error": "method not allowed"})
		return
	}

	worldIDStr := chi.URLParam(r, "id")
	worldID, err := strconv.Atoi(worldIDStr)
	if err != nil {
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid world ID"})
		return
	}

	var req struct {
		Rating int `json:"rating"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid JSON body"})
		return
	}

	if req.Rating < 1 || req.Rating > 5 {
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "rating must be between 1 and 5"})
		return
	}

	currentUser := middleware.GetUser(r)
	currentUserID := int(currentUser.ID)

	//* Verify world exists
	world, err := h.worldStore.GetWorldById(worldID)
	if err != nil {
		utils.WriteResponseJSON(w, http.StatusNotFound, utils.ResponseEnvelope{"error": "world not found"})
		return
	}

	//* Only allow rating published worlds
	if world.Visibility != "published" {
		utils.WriteResponseJSON(w, http.StatusForbidden, utils.ResponseEnvelope{"error": "can only rate published worlds"})
		return
	}

	err = h.worldStore.RateWorld(currentUserID, worldID, req.Rating)
	if err != nil {
		h.logger.Printf("ERROR: failed to rate world: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "failed to rate world"})
		return
	}

	//* Get updated rating info
	avgRating, ratingCount, err := h.worldStore.GetWorldRating(worldID)
	if err != nil {
		h.logger.Printf("ERROR: failed to get updated rating: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "rating saved but failed to retrieve updated rating"})
		return
	}

	utils.WriteResponseJSON(w, http.StatusOK, utils.ResponseEnvelope{
		"success":      true,
		"user_rating":  req.Rating,
		"avg_rating":   avgRating,
		"rating_count": ratingCount,
	})
}
