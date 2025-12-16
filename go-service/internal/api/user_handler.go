package api

import (
	"log"
	"net/http"

	"github.com/mdombrov-33/loresmith/go-service/internal/middleware"
	"github.com/mdombrov-33/loresmith/go-service/internal/store"
	"github.com/mdombrov-33/loresmith/go-service/internal/utils"
)

type UserHandler struct {
	userStore store.UserStore
	logger    *log.Logger
}

func NewUserHandler(userStore store.UserStore, logger *log.Logger) *UserHandler {
	return &UserHandler{
		userStore: userStore,
		logger:    logger,
	}
}

// * HandleGetCurrentUser returns the local user record for the authenticated Clerk user
// * Required because Zustand needs the local user ID for database queries
func (h *UserHandler) HandleGetCurrentUser(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r)
	if user == nil {
		utils.WriteResponseJSON(w, http.StatusUnauthorized, utils.ResponseEnvelope{"error": "not authenticated"})
		return
	}

	utils.WriteResponseJSON(w, http.StatusOK, utils.ResponseEnvelope{"user": user})
}
