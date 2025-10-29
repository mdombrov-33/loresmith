package api

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"sync"

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
	logger         *log.Logger
}

func NewWorldHandler(loreClient lorepb.LoreServiceClient, worldStore store.WorldStore, adventureStore store.AdventureStore, logger *log.Logger) *WorldHandler {
	return &WorldHandler{
		loreClient:     loreClient,
		worldStore:     worldStore,
		adventureStore: adventureStore,
		logger:         logger,
	}
}

func (h *WorldHandler) HandleCreateDraftWorld(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJSON(w, http.StatusMethodNotAllowed, utils.Envelope{"error": "method not allowed"})
		return
	}

	currentUser := middleware.GetUser(r)

	var req struct {
		Pieces map[string]*lorepb.LorePiece `json:"pieces"`
		Theme  string                       `json:"theme"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "invalid JSON body"})
		return
	}

	log.Printf("DEBUG: HandleCreateDraftWorld received req: %+v", req)

	grpcReq := &lorepb.FullStoryRequest{
		Pieces: &lorepb.SelectedLorePieces{
			Character: req.Pieces["character"],
			Faction:   req.Pieces["faction"],
			Setting:   req.Pieces["setting"],
			Event:     req.Pieces["event"],
			Relic:     req.Pieces["relic"],
		},
		Theme: req.Theme,
	}
	grpcResp, err := h.loreClient.GenerateFullStory(r.Context(), grpcReq)
	if err != nil {
		h.logger.Printf("ERROR: gRPC call for generating full story failed: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to generate full story"})
		return
	}

	embeddingReq := &lorepb.EmbeddingRequest{
		Text: grpcResp.Story.Content,
	}
	embeddingResp, err := h.loreClient.GenerateEmbedding(r.Context(), embeddingReq)
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
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to save draft"})
		return
	}

	utils.WriteJSON(w, http.StatusCreated, utils.Envelope{"world_id": worldID})
}

func (h *WorldHandler) HandleGetWorldById(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteJSON(w, http.StatusMethodNotAllowed, utils.Envelope{"error": "method not allowed"})
		return
	}

	worldIDStr := chi.URLParam(r, "id")
	worldID, err := strconv.Atoi(worldIDStr)
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "invalid world ID"})
		return
	}

	world, err := h.worldStore.GetWorldById(worldID)
	if err != nil {
		h.logger.Printf("ERROR: failed to get world: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to get world"})
		return
	}
	if world == nil {
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"error": "world not found"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"world": world})
}

func (h *WorldHandler) HandleSearchWorlds(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteJSON(w, http.StatusMethodNotAllowed, utils.Envelope{"error": "method not allowed"})
		return
	}

	query := r.URL.Query()
	searchQuery := query.Get("q")

	if searchQuery == "" {
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "search query 'q' is required"})
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
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "invalid scope"})
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
	embeddingResp, err := h.loreClient.GenerateEmbedding(r.Context(), embeddingReq)
	if err != nil {
		h.logger.Printf("ERROR: failed to generate search embedding: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to generate search embedding"})
		return
	}

	if len(embeddingResp.Embedding) == 0 {
		h.logger.Printf("ERROR: received empty embedding")
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "invalid embedding generated"})
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
			utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to search worlds"})
			return
		}

		rerankedWorlds := allWorlds
		if len(allWorlds) > 1 {
			rerankReq := &lorepb.RerankSearchRequest{
				Query:          searchQuery,
				Worlds:         utils.ConvertToWorldResults(allWorlds),
				QueryEmbedding: embeddingResp.Embedding,
			}

			rerankResp, err := h.loreClient.RerankResults(r.Context(), rerankReq)
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
			utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to search worlds"})
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

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{
		"worlds": finalWorlds,
		"total":  total,
		"query":  searchQuery,
	})
}

func (h *WorldHandler) HandleGetWorldsByFilters(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteJSON(w, http.StatusMethodNotAllowed, utils.Envelope{"error": "method not allowed"})
		return
	}

	query := r.URL.Query()
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
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "invalid scope"})
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

	worlds, total, err := h.worldStore.GetWorldsByFilters(userID, theme, status, includeUserName, currentUserID, limit, offset)
	if err != nil {
		h.logger.Printf("ERROR: failed to get worlds: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to get worlds"})
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

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{
		"worlds": worlds,
		"total":  total,
	})
}

func (h *WorldHandler) HandleDeleteWorldById(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		utils.WriteJSON(w, http.StatusMethodNotAllowed, utils.Envelope{"error": "method not allowed"})
		return
	}

	worldIDStr := chi.URLParam(r, "id")
	worldID, err := strconv.Atoi(worldIDStr)
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "invalid world ID"})
		return
	}

	err = h.worldStore.DeleteWorldById(worldID)
	if err != nil {
		h.logger.Printf("ERROR: failed to delete world: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to delete world"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"message": "world deleted successfully"})
}

func (h *WorldHandler) HandleUpdateWorldVisibility(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		utils.WriteJSON(w, http.StatusMethodNotAllowed, utils.Envelope{"error": "method not allowed"})
		return
	}

	worldIDStr := chi.URLParam(r, "id")
	worldID, err := strconv.Atoi(worldIDStr)
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "invalid world ID"})
		return
	}

	var req struct {
		Visibility string `json:"visibility"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "invalid JSON body"})
		return
	}

	if req.Visibility != "private" && req.Visibility != "published" {
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "visibility must be 'private' or 'published'"})
		return
	}

	currentUser := middleware.GetUser(r)
	world, err := h.worldStore.GetWorldById(worldID)
	if err != nil {
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"error": "world not found"})
		return
	}

	if world.UserID != int(currentUser.ID) {
		utils.WriteJSON(w, http.StatusForbidden, utils.Envelope{"error": "not authorized to update this world"})
		return
	}

	err = h.worldStore.UpdateWorldVisibility(worldID, req.Visibility)
	if err != nil {
		h.logger.Printf("ERROR: failed to update world visibility: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to update visibility"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"success": true, "visibility": req.Visibility})
}
