package api

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/mdombrov-33/loresmith/go-service/gen/lorepb"
	"github.com/mdombrov-33/loresmith/go-service/internal/middleware"
	"github.com/mdombrov-33/loresmith/go-service/internal/store"
	"github.com/mdombrov-33/loresmith/go-service/internal/utils"
)

type WorldHandler struct {
	loreClient lorepb.LoreServiceClient
	worldStore store.WorldStore
	logger     *log.Logger
}

func NewWorldHandler(loreClient lorepb.LoreServiceClient, worldStore store.WorldStore, logger *log.Logger) *WorldHandler {
	return &WorldHandler{
		loreClient: loreClient,
		worldStore: worldStore,
		logger:     logger,
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

	worlds, total, err := h.worldStore.SearchWorldsByEmbedding(embeddingResp.Embedding, userID, theme, status, includeUserName, limit, offset)
	if err != nil {
		h.logger.Printf("ERROR: failed to search worlds: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to search worlds"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{
		"worlds": worlds,
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

	worlds, total, err := h.worldStore.GetWorldsByFilters(userID, theme, status, includeUserName, limit, offset)
	if err != nil {
		h.logger.Printf("ERROR: failed to get worlds: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to get worlds"})
		return
	}

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
