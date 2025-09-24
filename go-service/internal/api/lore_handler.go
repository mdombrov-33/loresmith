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

type generateCharactersRequest struct {
	Theme      string
	Count      int32
	Regenerate bool
}

func NewLoreHandler(loreClient lorepb.LoreServiceClient, logger *log.Logger) *LoreHandler {
	return &LoreHandler{loreClient: loreClient, logger: logger}
}

func (h *LoreHandler) HandleGenerateCharacters(w http.ResponseWriter, r *http.Request) {
	req := generateCharactersRequest{
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
