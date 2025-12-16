package middleware

import (
	"context"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/jwt"
	"github.com/mdombrov-33/loresmith/go-service/internal/store"
	"github.com/mdombrov-33/loresmith/go-service/internal/utils"
)

func init() {
	//* Initialize Clerk SDK with secret key
	secretKey := os.Getenv("CLERK_SECRET_KEY")
	if secretKey != "" {
		clerk.SetKey(secretKey)
	}
}

type contextKey string

const UserContextKey = contextKey("user")

type Middleware struct {
	UserStore store.UserStore
	Logger    *log.Logger
}

// * SetUser stores the authenticated user in request context
func SetUser(r *http.Request, user *store.User) *http.Request {
	ctx := context.WithValue(r.Context(), UserContextKey, user)
	return r.WithContext(ctx)
}

// * GetUser retrieves the authenticated user from request context
func GetUser(r *http.Request) *store.User {
	user, ok := r.Context().Value(UserContextKey).(*store.User)
	if !ok {
		panic("missing user in context")
	}
	return user
}

// * Authenticate middleware verifies Clerk JWT tokens and fetches user from local database
func (m *Middleware) Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// * Extract token from Authorization header or __session cookie
		token := extractClerkToken(r)
		if token == "" {
			utils.WriteResponseJSON(w, http.StatusUnauthorized, utils.ResponseEnvelope{"error": "missing authorization token"})
			return
		}

		// * Verify Clerk JWT token (SDK reads CLERK_SECRET_KEY from env automatically)
		// * Allow 60 seconds of leeway to handle clock skew between systems(prevents docker-synced environments from failing)
		claims, err := jwt.Verify(r.Context(), &jwt.VerifyParams{
			Token:  token,
			Leeway: 60 * time.Second,
		})
		if err != nil {
			m.Logger.Printf("ERROR: Clerk JWT verification failed: %v", err)
			utils.WriteResponseJSON(w, http.StatusUnauthorized, utils.ResponseEnvelope{"error": "invalid token"})
			return
		}

		// * Extract Clerk user ID from claims
		clerkUserID := claims.Subject
		if clerkUserID == "" {
			m.Logger.Printf("ERROR: Clerk user ID not found in token claims")
			utils.WriteResponseJSON(w, http.StatusUnauthorized, utils.ResponseEnvelope{"error": "invalid token claims"})
			return
		}

		// * Fetch local user record by Clerk ID
		user, err := m.UserStore.GetUserByClerkID(clerkUserID)
		if err != nil {
			m.Logger.Printf("ERROR: Database error fetching user for Clerk ID %s: %v", clerkUserID, err)
			utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "authentication failed"})
			return
		}

		// * User doesn't exist locally - webhook hasn't synced yet
		if user == nil {
			m.Logger.Printf("ERROR: User not found for Clerk ID %s - webhook sync may not have completed", clerkUserID)
			utils.WriteResponseJSON(w, http.StatusUnauthorized, utils.ResponseEnvelope{
				"error": "user not found - please try again in a moment",
			})
			return
		}

		r = SetUser(r, user)
		next.ServeHTTP(w, r)
	})
}

// * extractClerkToken extracts the session token from request
func extractClerkToken(r *http.Request) string {
	// Try Authorization header first
	authHeader := r.Header.Get("Authorization")
	if authHeader != "" {
		parts := strings.Split(authHeader, " ")
		if len(parts) == 2 && parts[0] == "Bearer" {
			return parts[1]
		}
	}

	// * Try __session cookie (Clerk's default cookie name)
	cookie, err := r.Cookie("__session")
	if err == nil && cookie.Value != "" {
		return cookie.Value
	}

	return ""
}
