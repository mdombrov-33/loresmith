package api

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/mdombrov-33/loresmith/go-service/gen/lorepb"
	"github.com/mdombrov-33/loresmith/go-service/internal/utils"
)

// deserializeDetails deserializes any JSON strings in the Details map
// (e.g., skills array stored as JSON string from gRPC)
func deserializeDetails(details map[string]string) map[string]any {
	result := make(map[string]any)
	for key, value := range details {
		var parsed interface{}
		if err := json.Unmarshal([]byte(value), &parsed); err == nil {
			// Successfully parsed - it was a JSON string
			result[key] = parsed
		} else {
			// Not JSON - keep as string
			result[key] = value
		}
	}
	return result
}

func mapToLorePiece(m map[string]interface{}) *lorepb.LorePiece {
	if m == nil {
		return nil
	}

	details := make(map[string]string)
	if d, ok := m["details"].(map[string]interface{}); ok {
		for k, v := range d {
			if s, ok := v.(string); ok {
				details[k] = s
			} else {
				jsonBytes, _ := json.Marshal(v)
				details[k] = string(jsonBytes)
			}
		}
	}

	name, _ := m["name"].(string)
	description, _ := m["description"].(string)
	pieceType, _ := m["type"].(string)

	return &lorepb.LorePiece{
		Name:        name,
		Description: description,
		Details:     details,
		Type:        pieceType,
	}
}

type LoreHandler struct {
	loreClient lorepb.LoreServiceClient
	logger     *log.Logger
}

type generateLoreRequest struct {
	Theme           string                 `json:"theme"`
	Count           int32                  `json:"count"`
	SelectedSetting map[string]interface{} `json:"selectedSetting,omitempty"`
	SelectedEvent   map[string]interface{} `json:"selectedEvent,omitempty"`
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
			utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid count (1-10)"})
			return
		}
	}

	if regenerateStr := r.URL.Query().Get("regenerate"); regenerateStr == "true" {
	}

	ctx, cancel := utils.NewGRPCContext(utils.OpGenerateLore)
	defer cancel()

	grpcReq := &lorepb.CharactersRequest{
		Theme:      req.Theme,
		Count:      req.Count,
	}

	grpcResp, err := h.loreClient.GenerateCharacters(ctx, grpcReq)
	if err != nil {
		h.logger.Printf("ERROR: gRPC call for generating characters failed: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "failed to generate characters"})
		return
	}

	characters := make([]map[string]any, len(grpcResp.Characters))
	for i, piece := range grpcResp.Characters {
		characters[i] = map[string]any{
			"name":        piece.Name,
			"description": piece.Description,
			"details":     deserializeDetails(piece.Details),
			"type":        piece.Type,
		}
	}

	utils.WriteResponseJSON(w, http.StatusOK, utils.ResponseEnvelope{"characters": characters})
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
			utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid count (1-10)"})
			return
		}
	}

	if regenerateStr := r.URL.Query().Get("regenerate"); regenerateStr == "true" {
	}

	ctx, cancel := utils.NewGRPCContext(utils.OpGenerateLore)
	defer cancel()
	grpcReq := &lorepb.FactionsRequest{
		Theme:      req.Theme,
		Count:      req.Count,
	}

	grpcResp, err := h.loreClient.GenerateFactions(ctx, grpcReq)
	if err != nil {
		h.logger.Printf("ERROR: gRPC call for generating factions failed: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "failed to generate factions"})
		return
	}

	factions := make([]map[string]any, len(grpcResp.Factions))
	for i, piece := range grpcResp.Factions {
		factions[i] = map[string]any{
			"name":        piece.Name,
			"description": piece.Description,
			"details":     deserializeDetails(piece.Details),
			"type":        piece.Type,
		}
	}

	utils.WriteResponseJSON(w, http.StatusOK, utils.ResponseEnvelope{"factions": factions})
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
			utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid count (1-10)"})
			return
		}
	}

	if regenerateStr := r.URL.Query().Get("regenerate"); regenerateStr == "true" {
	}

	ctx, cancel := utils.NewGRPCContext(utils.OpGenerateLore)
	defer cancel()
	grpcReq := &lorepb.SettingsRequest{
		Theme:      req.Theme,
		Count:      req.Count,
	}

	grpcResp, err := h.loreClient.GenerateSettings(ctx, grpcReq)
	if err != nil {
		h.logger.Printf("ERROR: gRPC call for generating settings failed: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "failed to generate settings"})
		return
	}

	settings := make([]map[string]any, len(grpcResp.Settings))
	for i, piece := range grpcResp.Settings {
		settings[i] = map[string]any{
			"name":        piece.Name,
			"description": piece.Description,
			"details":     deserializeDetails(piece.Details),
			"type":        piece.Type,
		}
	}

	utils.WriteResponseJSON(w, http.StatusOK, utils.ResponseEnvelope{"settings": settings})
}

func (h *LoreHandler) HandleGenerateEvents(w http.ResponseWriter, r *http.Request) {
	var req generateLoreRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid request body"})
		return
	}

	if req.Theme == "" {
		req.Theme = "post-apocalyptic"
	}
	if req.Count == 0 {
		req.Count = 3
	}
	if req.Count < 1 || req.Count > 10 {
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid count (1-10)"})
		return
	}

	if req.SelectedSetting == nil {
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "selectedSetting is required"})
		return
	}

	ctx, cancel := utils.NewGRPCContext(utils.OpGenerateLore)
	defer cancel()
	grpcReq := &lorepb.EventsRequest{
		Theme:           req.Theme,
		Count:           req.Count,
		SelectedSetting: mapToLorePiece(req.SelectedSetting),
	}

	grpcResp, err := h.loreClient.GenerateEvents(ctx, grpcReq)
	if err != nil {
		h.logger.Printf("ERROR: gRPC call for generating events failed: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "failed to generate events"})
		return
	}

	events := make([]map[string]any, len(grpcResp.Events))
	for i, piece := range grpcResp.Events {
		events[i] = map[string]any{
			"name":        piece.Name,
			"description": piece.Description,
			"details":     deserializeDetails(piece.Details),
			"type":        piece.Type,
		}
	}

	utils.WriteResponseJSON(w, http.StatusOK, utils.ResponseEnvelope{"events": events})
}

func (h *LoreHandler) HandleGenerateRelics(w http.ResponseWriter, r *http.Request) {
	var req generateLoreRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid request body"})
		return
	}

	if req.Theme == "" {
		req.Theme = "post-apocalyptic"
	}
	if req.Count == 0 {
		req.Count = 3
	}
	if req.Count < 1 || req.Count > 10 {
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid count (1-10)"})
		return
	}

	if req.SelectedSetting == nil || req.SelectedEvent == nil {
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "selectedSetting and selectedEvent are required"})
		return
	}

	ctx, cancel := utils.NewGRPCContext(utils.OpGenerateLore)
	defer cancel()
	grpcReq := &lorepb.RelicsRequest{
		Theme:           req.Theme,
		Count:           req.Count,
		SelectedSetting: mapToLorePiece(req.SelectedSetting),
		SelectedEvent:   mapToLorePiece(req.SelectedEvent),
	}

	grpcResp, err := h.loreClient.GenerateRelics(ctx, grpcReq)
	if err != nil {
		h.logger.Printf("ERROR: gRPC call for generating relics failed: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "failed to generate relics"})
		return
	}

	relics := make([]map[string]any, len(grpcResp.Relics))
	for i, piece := range grpcResp.Relics {
		relics[i] = map[string]any{
			"name":        piece.Name,
			"description": piece.Description,
			"details":     deserializeDetails(piece.Details),
			"type":        piece.Type,
		}
	}

	utils.WriteResponseJSON(w, http.StatusOK, utils.ResponseEnvelope{"relics": relics})
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
			utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid count (1-10)"})
			return
		}
	}

	if regenerateStr := r.URL.Query().Get("regenerate"); regenerateStr == "true" {
	}

	ctx, cancel := utils.NewGRPCContext(utils.OpGenerateLore)
	defer cancel()
	grpcReq := &lorepb.AllRequest{
		Theme:      req.Theme,
		Count:      req.Count,
	}

	grpcResp, err := h.loreClient.GenerateAll(ctx, grpcReq)
	if err != nil {
		h.logger.Printf("ERROR: gRPC call for generating all lore variants failed: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "failed to generate all lore variants"})
		return
	}

	characters := make([]map[string]any, len(grpcResp.Characters))
	for i, piece := range grpcResp.Characters {
		characters[i] = map[string]any{
			"name":        piece.Name,
			"description": piece.Description,
			"details":     deserializeDetails(piece.Details),
			"type":        piece.Type,
		}
	}

	factions := make([]map[string]any, len(grpcResp.Factions))
	for i, piece := range grpcResp.Factions {
		factions[i] = map[string]any{
			"name":        piece.Name,
			"description": piece.Description,
			"details":     deserializeDetails(piece.Details),
			"type":        piece.Type,
		}
	}

	settings := make([]map[string]any, len(grpcResp.Settings))
	for i, piece := range grpcResp.Settings {
		settings[i] = map[string]any{
			"name":        piece.Name,
			"description": piece.Description,
			"details":     deserializeDetails(piece.Details),
			"type":        piece.Type,
		}
	}

	events := make([]map[string]any, len(grpcResp.Events))
	for i, piece := range grpcResp.Events {
		events[i] = map[string]any{
			"name":        piece.Name,
			"description": piece.Description,
			"details":     deserializeDetails(piece.Details),
			"type":        piece.Type,
		}
	}

	relics := make([]map[string]any, len(grpcResp.Relics))
	for i, piece := range grpcResp.Relics {
		relics[i] = map[string]any{
			"name":        piece.Name,
			"description": piece.Description,
			"details":     deserializeDetails(piece.Details),
			"type":        piece.Type,
		}
	}

	utils.WriteResponseJSON(w, http.StatusOK, utils.ResponseEnvelope{
		"characters": characters,
		"factions":   factions,
		"settings":   settings,
		"events":     events,
		"relics":     relics,
	})
}

func (h *LoreHandler) HandleGenerateFullStory(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteResponseJSON(w, http.StatusMethodNotAllowed, utils.ResponseEnvelope{"error": "method not allowed"})
		return
	}

	var selectedLorePieces lorepb.SelectedLorePieces
	if err := json.NewDecoder(r.Body).Decode(&selectedLorePieces); err != nil {
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid JSON body"})
		return
	}

	theme := r.URL.Query().Get("theme")
	if theme == "" {
		theme = "post-apocalyptic"
	}

	grpcReq := &lorepb.FullStoryRequest{
		Pieces: &selectedLorePieces,
		Theme:  theme,
	}

	grpcResp, err := h.loreClient.GenerateFullStory(r.Context(), grpcReq)
	if err != nil {
		h.logger.Printf("ERROR: gRPC call for generating full story failed: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "failed to generate full story"})
		return
	}

	pieces := map[string]any{
		"characters": grpcResp.Story.Pieces.Character,
		"factions":   grpcResp.Story.Pieces.Faction,
		"settings":   grpcResp.Story.Pieces.Setting,
		"events":     grpcResp.Story.Pieces.Event,
		"relics":     grpcResp.Story.Pieces.Relic,
	}
	response := map[string]any{
		"content": grpcResp.Story.Content,
		"theme":   grpcResp.Story.Theme,
		"pieces":  pieces,
		"quest":   grpcResp.Story.Quest,
	}

	utils.WriteResponseJSON(w, http.StatusOK, utils.ResponseEnvelope{"story": response})
}
