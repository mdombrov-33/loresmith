package api

import (
	"log"
	"net/http"
	"strconv"

	"github.com/mdombrov-33/loresmith/go-service/gen/lorepb"
	"github.com/mdombrov-33/loresmith/go-service/internal/utils"
)

type LoreHandler struct {
	loreClient lorepb.LoreServiceClient
	logger     *log.Logger
}

type generateLoreRequest struct {
	Theme      string
	Count      int32
	Regenerate bool
}

func NewLoreHandler(loreClient lorepb.LoreServiceClient, logger *log.Logger) *LoreHandler {
	return &LoreHandler{loreClient: loreClient, logger: logger}
}

func (h *LoreHandler) HandleGenerateCharacters(w http.ResponseWriter, r *http.Request) {
	req := generateLoreRequest{
		Theme: "post-apocalyptic", // Default
		Count: 3,                  // Default
	}

	if theme := r.URL.Query().Get("theme"); theme != "" {
		req.Theme = theme
	}

	if countStr := r.URL.Query().Get("count"); countStr != "" {
		if parsed, err := strconv.Atoi(countStr); err == nil && parsed >= 1 && parsed <= 10 {
			req.Count = int32(parsed)
		} else {
			utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "invalid count (1-10)"})
			return
		}
	}

	if regenerateStr := r.URL.Query().Get("regenerate"); regenerateStr == "true" {
		req.Regenerate = true
	}

	ctx := r.Context()
	grpcReq := &lorepb.CharactersRequest{
		Theme:      req.Theme,
		Count:      req.Count,
		Regenerate: req.Regenerate,
	}

	grpcResp, err := h.loreClient.GenerateCharacters(ctx, grpcReq)
	if err != nil {
		h.logger.Printf("ERROR: gRPC call for generating characters failed: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to generate characters"})
		return
	}

	characters := make([]map[string]any, len(grpcResp.Characters))
	for i, piece := range grpcResp.Characters {
		characters[i] = map[string]any{
			"name":        piece.Name,
			"description": piece.Description,
			"details":     piece.Details, // map[string]string
			"type":        piece.Type,
		}
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"characters": characters})
}

func (h *LoreHandler) HandleGenerateFactions(w http.ResponseWriter, r *http.Request) {
	req := generateLoreRequest{
		Theme: "post-apocalyptic",
		Count: 3,
	}

	if theme := r.URL.Query().Get("theme"); theme != "" {
		req.Theme = theme
	}

	if countStr := r.URL.Query().Get("count"); countStr != "" {
		if parsed, err := strconv.Atoi(countStr); err == nil && parsed >= 1 && parsed <= 10 {
			req.Count = int32(parsed)
		} else {
			utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "invalid count (1-10)"})
			return
		}
	}

	if regenerateStr := r.URL.Query().Get("regenerate"); regenerateStr == "true" {
		req.Regenerate = true
	}

	ctx := r.Context()
	grpcReq := &lorepb.FactionsRequest{
		Theme:      req.Theme,
		Count:      req.Count,
		Regenerate: req.Regenerate,
	}

	grpcResp, err := h.loreClient.GenerateFactions(ctx, grpcReq)
	if err != nil {
		h.logger.Printf("ERROR: gRPC call for generating factions failed: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to generate factions"})
		return
	}

	factions := make([]map[string]any, len(grpcResp.Factions))
	for i, piece := range grpcResp.Factions {
		factions[i] = map[string]any{
			"name":        piece.Name,
			"description": piece.Description,
			"details":     piece.Details,
			"type":        piece.Type,
		}
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"factions": factions})
}

func (h *LoreHandler) HandleGenerateSettings(w http.ResponseWriter, r *http.Request) {
	req := generateLoreRequest{
		Theme: "post-apocalyptic",
		Count: 3,
	}

	if theme := r.URL.Query().Get("theme"); theme != "" {
		req.Theme = theme
	}

	if countStr := r.URL.Query().Get("count"); countStr != "" {
		if parsed, err := strconv.Atoi(countStr); err == nil && parsed >= 1 && parsed <= 10 {
			req.Count = int32(parsed)
		} else {
			utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "invalid count (1-10)"})
			return
		}
	}

	if regenerateStr := r.URL.Query().Get("regenerate"); regenerateStr == "true" {
		req.Regenerate = true
	}

	ctx := r.Context()
	grpcReq := &lorepb.SettingsRequest{
		Theme:      req.Theme,
		Count:      req.Count,
		Regenerate: req.Regenerate,
	}

	grpcResp, err := h.loreClient.GenerateSettings(ctx, grpcReq)
	if err != nil {
		h.logger.Printf("ERROR: gRPC call for generating settings failed: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to generate settings"})
		return
	}

	settings := make([]map[string]any, len(grpcResp.Settings))
	for i, piece := range grpcResp.Settings {
		settings[i] = map[string]any{
			"name":        piece.Name,
			"description": piece.Description,
			"details":     piece.Details,
			"type":        piece.Type,
		}
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"settings": settings})
}

func (h *LoreHandler) HandleGenerateEvents(w http.ResponseWriter, r *http.Request) {
	req := generateLoreRequest{
		Theme: "post-apocalyptic",
		Count: 3,
	}

	if theme := r.URL.Query().Get("theme"); theme != "" {
		req.Theme = theme
	}

	if countStr := r.URL.Query().Get("count"); countStr != "" {
		if parsed, err := strconv.Atoi(countStr); err == nil && parsed >= 1 && parsed <= 10 {
			req.Count = int32(parsed)
		} else {
			utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "invalid count (1-10)"})
			return
		}
	}

	if regenerateStr := r.URL.Query().Get("regenerate"); regenerateStr == "true" {
		req.Regenerate = true
	}

	ctx := r.Context()
	grpcReq := &lorepb.EventsRequest{
		Theme:      req.Theme,
		Count:      req.Count,
		Regenerate: req.Regenerate,
	}

	grpcResp, err := h.loreClient.GenerateEvents(ctx, grpcReq)
	if err != nil {
		h.logger.Printf("ERROR: gRPC call for generating events failed: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to generate events"})
		return
	}

	events := make([]map[string]any, len(grpcResp.Events))
	for i, piece := range grpcResp.Events {
		events[i] = map[string]any{
			"name":        piece.Name,
			"description": piece.Description,
			"details":     piece.Details,
			"type":        piece.Type,
		}
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"events": events})
}

func (h *LoreHandler) HandleGenerateRelics(w http.ResponseWriter, r *http.Request) {
	req := generateLoreRequest{
		Theme: "post-apocalyptic",
		Count: 3,
	}

	if theme := r.URL.Query().Get("theme"); theme != "" {
		req.Theme = theme
	}

	if countStr := r.URL.Query().Get("count"); countStr != "" {
		if parsed, err := strconv.Atoi(countStr); err == nil && parsed >= 1 && parsed <= 10 {
			req.Count = int32(parsed)
		} else {
			utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "invalid count (1-10)"})
			return
		}
	}

	if regenerateStr := r.URL.Query().Get("regenerate"); regenerateStr == "true" {
		req.Regenerate = true
	}

	ctx := r.Context()
	grpcReq := &lorepb.RelicsRequest{
		Theme:      req.Theme,
		Count:      req.Count,
		Regenerate: req.Regenerate,
	}

	grpcResp, err := h.loreClient.GenerateRelics(ctx, grpcReq)
	if err != nil {
		h.logger.Printf("ERROR: gRPC call for generating relics failed: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to generate relics"})
		return
	}

	relics := make([]map[string]any, len(grpcResp.Relics))
	for i, piece := range grpcResp.Relics {
		relics[i] = map[string]any{
			"name":        piece.Name,
			"description": piece.Description,
			"details":     piece.Details,
			"type":        piece.Type,
		}
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"relics": relics})
}

func (h *LoreHandler) HandleGenerateAll(w http.ResponseWriter, r *http.Request) {
	req := generateLoreRequest{
		Theme: "post-apocalyptic",
		Count: 3,
	}

	if theme := r.URL.Query().Get("theme"); theme != "" {
		req.Theme = theme
	}

	if countStr := r.URL.Query().Get("count"); countStr != "" {
		if parsed, err := strconv.Atoi(countStr); err == nil && parsed >= 1 && parsed <= 10 {
			req.Count = int32(parsed)
		} else {
			utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "invalid count (1-10)"})
			return
		}
	}

	if regenerateStr := r.URL.Query().Get("regenerate"); regenerateStr == "true" {
		req.Regenerate = true
	}

	ctx := r.Context()
	grpcReq := &lorepb.AllRequest{
		Theme:      req.Theme,
		Count:      req.Count,
		Regenerate: req.Regenerate,
	}

	grpcResp, err := h.loreClient.GenerateAll(ctx, grpcReq)
	if err != nil {
		h.logger.Printf("ERROR: gRPC call for generating all lore variants failed: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to generate all lore variants"})
		return
	}

	characters := make([]map[string]any, len(grpcResp.Characters))
	for i, piece := range grpcResp.Characters {
		characters[i] = map[string]any{
			"name":        piece.Name,
			"description": piece.Description,
			"details":     piece.Details,
			"type":        piece.Type,
		}
	}

	factions := make([]map[string]any, len(grpcResp.Factions))
	for i, piece := range grpcResp.Factions {
		factions[i] = map[string]any{
			"name":        piece.Name,
			"description": piece.Description,
			"details":     piece.Details,
			"type":        piece.Type,
		}
	}

	settings := make([]map[string]any, len(grpcResp.Settings))
	for i, piece := range grpcResp.Settings {
		settings[i] = map[string]any{
			"name":        piece.Name,
			"description": piece.Description,
			"details":     piece.Details,
			"type":        piece.Type,
		}
	}

	events := make([]map[string]any, len(grpcResp.Events))
	for i, piece := range grpcResp.Events {
		events[i] = map[string]any{
			"name":        piece.Name,
			"description": piece.Description,
			"details":     piece.Details,
			"type":        piece.Type,
		}
	}

	relics := make([]map[string]any, len(grpcResp.Relics))
	for i, piece := range grpcResp.Relics {
		relics[i] = map[string]any{
			"name":        piece.Name,
			"description": piece.Description,
			"details":     piece.Details,
			"type":        piece.Type,
		}
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{
		"characters": characters,
		"factions":   factions,
		"settings":   settings,
		"events":     events,
		"relics":     relics,
	})
}
