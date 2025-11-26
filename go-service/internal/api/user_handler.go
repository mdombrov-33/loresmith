package api

import (
	"context"
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
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type UserHandler struct {
	userStore    store.UserStore
	logger       *log.Logger
	oauth2Config *oauth2.Config
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

func NewUserHandler(userStore store.UserStore, logger *log.Logger) *UserHandler {
	oauth2Config := &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}

	return &UserHandler{
		userStore:    userStore,
		logger:       logger,
		oauth2Config: oauth2Config,
	}
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
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid request payload"})
		return
	}

	err = h.validateRegisterRequest(&req)

	if err != nil {
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": err.Error()})
		return
	}

	user := &store.User{
		Username: req.Username,
		Email:    req.Email,
	}

	err = user.PasswordHash.Set(req.Password)
	if err != nil {
		h.logger.Printf("ERROR: hashing password: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "internal server error"})
		return
	}

	err = h.userStore.CreateUser(user)
	if err != nil {
		h.logger.Printf("ERROR: creating user: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "internal server error"})
		return
	}

	utils.WriteResponseJSON(w, http.StatusCreated, utils.ResponseEnvelope{"user": user})

}

func (h *UserHandler) HandleLoginUser(w http.ResponseWriter, r *http.Request) {
	var req loginUserRequest
	secret := os.Getenv("JWT_SECRET")

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		h.logger.Printf("ERROR: decoding login request: %v", err)
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid request payload"})
		return
	}

	user, err := h.userStore.GetUserByUsername(req.Username)
	if err != nil {
		h.logger.Printf("ERROR: fetching user by username: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "internal server error"})
		return
	}

	if user == nil {
		utils.WriteResponseJSON(w, http.StatusUnauthorized, utils.ResponseEnvelope{"error": "invalid credentials"})
		return
	}

	match, err := user.PasswordHash.Matches(req.Password)
	if err != nil {
		h.logger.Printf("ERROR: comparing password hash: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "internal server error"})
		return
	}

	if !match {
		utils.WriteResponseJSON(w, http.StatusUnauthorized, utils.ResponseEnvelope{"error": "invalid credentials"})
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
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "internal server error"})
		return
	}

	//* Set token as HTTP-only cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    tokenString,
		Path:     "/",
		MaxAge:   259200, //* 3 days
		HttpOnly: true,
		Secure:   false, //TODO: Set to true in production
		SameSite: http.SameSiteLaxMode,
	})

	utils.WriteResponseJSON(w, http.StatusOK, utils.ResponseEnvelope{
		"token": tokenString,
		"user": map[string]interface{}{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
		},
	})
}

func (h *UserHandler) HandleGoogleLogin(w http.ResponseWriter, r *http.Request) {
	//* Generate state token for CSRF protection
	state := utils.GenerateRandomString(32)

	//* Store state in cookie to verify in callback
	http.SetCookie(w, &http.Cookie{
		Name:     "oauth_state",
		Value:    state,
		Path:     "/",
		MaxAge:   600, //* 10 minutes
		HttpOnly: true,
		Secure:   false, //TODO: Set to true in production
		SameSite: http.SameSiteLaxMode,
	})

	//* Redirect to Google OAuth
	url := h.oauth2Config.AuthCodeURL(state, oauth2.AccessTypeOffline)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func (h *UserHandler) HandleGoogleCallback(w http.ResponseWriter, r *http.Request) {
	secret := os.Getenv("JWT_SECRET")
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	//* Verify state token
	stateCookie, err := r.Cookie("oauth_state")
	if err != nil {
		h.logger.Printf("ERROR: missing state cookie: %v", err)
		http.Redirect(w, r, frontendURL+"/?error=auth_failed", http.StatusTemporaryRedirect)
		return
	}

	state := r.URL.Query().Get("state")
	if state != stateCookie.Value {
		h.logger.Printf("ERROR: state mismatch")
		http.Redirect(w, r, frontendURL+"/?error=auth_failed", http.StatusTemporaryRedirect)
		return
	}

	//* Clear state cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "oauth_state",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
	})

	//* Exchange code for token
	code := r.URL.Query().Get("code")
	token, err := h.oauth2Config.Exchange(context.Background(), code)
	if err != nil {
		h.logger.Printf("ERROR: exchanging code for token: %v", err)
		http.Redirect(w, r, frontendURL+"/?error=auth_failed", http.StatusTemporaryRedirect)
		return
	}

	//* Get user info from Google
	client := h.oauth2Config.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		h.logger.Printf("ERROR: getting user info: %v", err)
		http.Redirect(w, r, frontendURL+"/?error=auth_failed", http.StatusTemporaryRedirect)
		return
	}
	defer resp.Body.Close()

	var googleUser struct {
		ID    string `json:"id"`
		Email string `json:"email"`
		Name  string `json:"name"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
		h.logger.Printf("ERROR: decoding user info: %v", err)
		http.Redirect(w, r, frontendURL+"/?error=auth_failed", http.StatusTemporaryRedirect)
		return
	}

	//* Find or create user
	user, err := h.userStore.GetUserByEmailAndProvider(googleUser.Email, "google")
	if err != nil {
		h.logger.Printf("ERROR: fetching user by email and provider: %v", err)
		http.Redirect(w, r, frontendURL+"/?error=auth_failed", http.StatusTemporaryRedirect)
		return
	}

	if user == nil {
		user = &store.User{
			Username:   googleUser.Name,
			Email:      googleUser.Email,
			Provider:   "google",
			ProviderID: googleUser.ID,
		}
		err = h.userStore.CreateUser(user)
		if err != nil {
			h.logger.Printf("ERROR: creating google user: %v", err)
			http.Redirect(w, r, frontendURL+"/?error=auth_failed", http.StatusTemporaryRedirect)
			return
		}
	}

	//* Generate JWT
	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"exp":      time.Now().Add(time.Hour * 72).Unix(),
	})

	tokenString, err := jwtToken.SignedString([]byte(secret))
	if err != nil {
		h.logger.Printf("ERROR: signing token: %v", err)
		http.Redirect(w, r, frontendURL+"/?error=auth_failed", http.StatusTemporaryRedirect)
		return
	}

	//* Set token as HTTP-only cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    tokenString,
		Path:     "/",
		MaxAge:   259200, //* 3 days
		HttpOnly: true,
		Secure:   false, //TODO: Set to true in production
		SameSite: http.SameSiteLaxMode,
	})

	//* Redirect to discover page
	http.Redirect(w, r, frontendURL+"/discover", http.StatusTemporaryRedirect)
}

func (h *UserHandler) HandleLogout(w http.ResponseWriter, r *http.Request) {
	//* Clear the token cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1, //* Delete cookie
		HttpOnly: true,
		Secure:   false, //TODO: Set to true in production
		SameSite: http.SameSiteLaxMode,
	})

	utils.WriteResponseJSON(w, http.StatusOK, utils.ResponseEnvelope{"message": "logged out successfully"})
}
