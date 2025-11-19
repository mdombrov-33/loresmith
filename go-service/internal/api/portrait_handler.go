package api

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/mdombrov-33/loresmith/go-service/internal/store"
)

type PortraitHandler struct {
	portraitStore *store.PortraitStore
	logger        *log.Logger
}

func NewPortraitHandler(portraitStore *store.PortraitStore, logger *log.Logger) *PortraitHandler {
	return &PortraitHandler{
		portraitStore: portraitStore,
		logger:        logger,
	}
}

type PortraitResponse struct {
	UUID      string `json:"uuid"`
	Portrait  string `json:"portrait,omitempty"`
	Ready     bool   `json:"ready"`
	Message   string `json:"message,omitempty"`
}

func (h *PortraitHandler) HandleGetTempPortrait(w http.ResponseWriter, r *http.Request) {
	uuid := chi.URLParam(r, "uuid")
	if uuid == "" {
		h.logger.Printf("Missing UUID parameter")
		http.Error(w, "UUID parameter is required", http.StatusBadRequest)
		return
	}

	portrait, err := h.portraitStore.GetPortrait(r.Context(), uuid)
	if err != nil {
		h.logger.Printf("Error retrieving portrait for UUID %s: %v", uuid, err)
		http.Error(w, "Failed to retrieve portrait", http.StatusInternalServerError)
		return
	}

	response := PortraitResponse{
		UUID: uuid,
	}

	if portrait != "" {
		response.Ready = true
		response.Portrait = portrait
		response.Message = "Portrait is ready"
	} else {
		response.Ready = false
		response.Message = "Portrait is being generated"
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		h.logger.Printf("Error encoding response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}
