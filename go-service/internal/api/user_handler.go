package api

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"regexp"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/mdombrov-33/loresmith/go-service/internal/store"
	"github.com/mdombrov-33/loresmith/go-service/internal/utils"
)

type UserHandler struct {
	userStore store.UserStore
	logger    *log.Logger
}

type registerUserRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginUserRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type googleAuthRequest struct {
	Email      string `json:"email"`
	Name       string `json:"name"`
	ProviderID string `json:"provider_id"`
}

func NewUserHandler(userStore store.UserStore, logger *log.Logger) *UserHandler {
	return &UserHandler{
		userStore: userStore,
		logger:    logger}
}

func (h *UserHandler) validateRegisterRequest(req *registerUserRequest) error {
	if req.Username == "" {
		return errors.New("username is required")
	}

	if len(req.Username) > 50 {
		return errors.New("username must be less than 50 characters")
	}

	if req.Email == "" {
		return errors.New("email is required")
	}

	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

	if !emailRegex.MatchString(req.Email) {
		return errors.New("invalid email format")
	}

	if req.Password == "" {
		return errors.New("password is required")
	}

	return nil
}

func (h *UserHandler) HandleRegisterUser(w http.ResponseWriter, r *http.Request) {
	var req registerUserRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		h.logger.Printf("ERROR: decoding register request: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "invalid request payload"})
		return
	}

	err = h.validateRegisterRequest(&req)

	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": err.Error()})
		return
	}

	user := &store.User{
		Username: req.Username,
		Email:    req.Email,
	}

	err = user.PasswordHash.Set(req.Password)
	if err != nil {
		h.logger.Printf("ERROR: hashing password: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "internal server error"})
		return
	}

	err = h.userStore.CreateUser(user)
	if err != nil {
		h.logger.Printf("ERROR: creating user: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "internal server error"})
		return
	}

	utils.WriteJSON(w, http.StatusCreated, utils.Envelope{"user": user})

}

func (h *UserHandler) HandleLoginUser(w http.ResponseWriter, r *http.Request) {
	var req loginUserRequest
	secret := os.Getenv("JWT_SECRET")

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		h.logger.Printf("ERROR: decoding login request: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "invalid request payload"})
		return
	}

	user, err := h.userStore.GetUserByUsername(req.Username)
	if err != nil {
		h.logger.Printf("ERROR: fetching user by username: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "internal server error"})
		return
	}

	if user == nil {
		utils.WriteJSON(w, http.StatusUnauthorized, utils.Envelope{"error": "invalid credentials"})
		return
	}

	match, err := user.PasswordHash.Matches(req.Password)
	if err != nil {
		h.logger.Printf("ERROR: comparing password hash: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "internal server error"})
		return
	}

	if !match {
		utils.WriteJSON(w, http.StatusUnauthorized, utils.Envelope{"error": "invalid credentials"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"exp":      time.Now().Add(time.Hour * 72).Unix(),
	})

	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		h.logger.Printf("ERROR: signing token: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "internal server error"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{
		"token": tokenString,
		"user": map[string]interface{}{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
		},
	})
}

func (h *UserHandler) HandleGoogleAuth(w http.ResponseWriter, r *http.Request) {
	var req googleAuthRequest
	secret := os.Getenv("JWT_SECRET")

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		h.logger.Printf("ERROR: decoding google auth request: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "invalid request payload"})
		return
	}

	if req.Email == "" || req.ProviderID == "" {
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "email and provider_id are required"})
		return
	}

	user, err := h.userStore.GetUserByEmailAndProvider(req.Email, "google")
	if err != nil {
		h.logger.Printf("ERROR: fetching user by email and provider: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "internal server error"})
		return
	}

	if user == nil {
		user = &store.User{
			Username:   req.Name,
			Email:      req.Email,
			Provider:   "google",
			ProviderID: req.ProviderID,
		}
		err = h.userStore.CreateUser(user)
		if err != nil {
			h.logger.Printf("ERROR: creating google user: %v", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "internal server error"})
			return
		}
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"exp":      time.Now().Add(time.Hour * 72).Unix(),
	})

	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		h.logger.Printf("ERROR: signing token: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "internal server error"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{
		"token": tokenString,
		"user": map[string]interface{}{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
		},
	})
}
