package api

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/mdombrov-33/loresmith/go-service/gen/lorepb"
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

	var req struct {
		Pieces lorepb.SelectedLorePieces `json:"pieces"`
		Theme  string                    `json:"theme"`
		UserID int                       `json:"user_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "invalid JSON body"})
		return
	}

	grpcReq := &lorepb.FullStoryRequest{
		Pieces: &req.Pieces,
		Theme:  req.Theme,
	}
	grpcResp, err := h.loreClient.GenerateFullStory(r.Context(), grpcReq)
	if err != nil {
		h.logger.Printf("ERROR: gRPC call for generating full story failed: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to generate full story"})
		return
	}

	worldID, err := h.worldStore.CreateWorld(req.UserID, req.Theme, grpcResp.Story, "draft")
	if err != nil {
		h.logger.Printf("ERROR: failed to save draft world: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to save draft"})
		return
	}

	utils.WriteJSON(w, http.StatusCreated, utils.Envelope{"world_id": worldID})
}

func (h *WorldHandler) HandleGetWorld(w http.ResponseWriter, r *http.Request) {
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

	world, err := h.worldStore.GetWorld(worldID)
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
