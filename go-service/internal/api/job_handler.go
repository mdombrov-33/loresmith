package api

import (
	"encoding/json"
	"net/http"

	"github.com/mdombrov-33/loresmith/go-service/internal/jobs"
)

type JobHandler struct {
	manager *jobs.Manager
}

func NewJobHandler(manager *jobs.Manager) *JobHandler {
	return &JobHandler{manager: manager}
}

// * CreateJob handles POST /api/jobs
func (h *JobHandler) CreateJob(w http.ResponseWriter, r *http.Request) {
	var req jobs.JobRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	job, err := h.manager.CreateJob(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(job)
}

// * GetJob handles GET /api/jobs/:id
func (h *JobHandler) GetJob(w http.ResponseWriter, r *http.Request) {
	jobID := r.PathValue("id")
	if jobID == "" {
		http.Error(w, "Job ID is required", http.StatusBadRequest)
		return
	}

	job, err := h.manager.GetJob(r.Context(), jobID)
	if err != nil {
		if err.Error() == "job not found: "+jobID {
			http.Error(w, "Job not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(job)
}
