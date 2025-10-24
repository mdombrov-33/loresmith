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

	var req struct {
		Pieces map[string]*lorepb.LorePiece `json:"pieces"`
		Theme  string                       `json:"theme"`
		UserID int                          `json:"user_id"`
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

func (h *WorldHandler) HandleGetWorlds(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteJSON(w, http.StatusMethodNotAllowed, utils.Envelope{"error": "method not allowed"})
		return
	}

	query := r.URL.Query()
	var userID *int
	var theme *string
	var status *string
	var scope string
	var limit int = 6
	var offset int = 0

	currentUser := middleware.GetUser(r)
	currentUserID := int(currentUser.ID)

	if scopeStr := query.Get("scope"); scopeStr != "" {
		scope = scopeStr
	} else {
		scope = "my" //* default to my worlds
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

	worlds, total, err := h.worldStore.GetWorldsWithFilters(userID, theme, status, includeUserName, limit, offset)
	if err != nil {
		h.logger.Printf("ERROR: failed to get worlds: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to get worlds"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"worlds": worlds, "total": total})
}
