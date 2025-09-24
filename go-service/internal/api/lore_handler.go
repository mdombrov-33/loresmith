package api

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/mdombrov-33/loresmith/go-service/gen/lorepb"
	"github.com/mdombrov-33/loresmith/go-service/internal/utils"
)

type LoreHandler struct {
	loreClient lorepb.LoreServiceClient
	logger     *log.Logger
}

type generateCharactersRequest struct {
	Theme string `json:"theme"`
	Count int32  `json:"count"`
}

func NewLoreHandler(loreClient lorepb.LoreServiceClient, logger *log.Logger) *LoreHandler {
	return &LoreHandler{loreClient: loreClient, logger: logger}
}

func (h *LoreHandler) HandleGenerateCharacters(w http.ResponseWriter, r *http.Request) {
	var req generateCharactersRequest
	err := json.NewDecoder(r.Body).Decode(&req)

	if err != nil {
		h.logger.Printf("ERROR: decoding generate characters request: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "invalid request payload"})
		return
	}

	ctx := r.Context()
	grpcReq := &lorepb.CharactersRequest{
		Theme: req.Theme,
		Count: req.Count,
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
