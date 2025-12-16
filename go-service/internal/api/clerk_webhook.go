package api

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/mdombrov-33/loresmith/go-service/internal/store"
	"github.com/mdombrov-33/loresmith/go-service/internal/utils"
	svix "github.com/svix/svix-webhooks/go"
)

type ClerkWebhookHandler struct {
	userStore     store.UserStore
	logger        *log.Logger
	webhookSecret string
}

func NewClerkWebhookHandler(userStore store.UserStore, logger *log.Logger, webhookSecret string) *ClerkWebhookHandler {
	return &ClerkWebhookHandler{
		userStore:     userStore,
		logger:        logger,
		webhookSecret: webhookSecret,
	}
}

// * HandleWebhook processes Clerk webhook events
func (h *ClerkWebhookHandler) HandleWebhook(w http.ResponseWriter, r *http.Request) {
	// Read body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		h.logger.Printf("ERROR: Failed to read webhook body: %v", err)
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid request"})
		return
	}

	//* Verify webhook signature using svix
	headers := http.Header{}
	headers.Set("svix-id", r.Header.Get("svix-id"))
	headers.Set("svix-timestamp", r.Header.Get("svix-timestamp"))
	headers.Set("svix-signature", r.Header.Get("svix-signature"))

	wh, err := svix.NewWebhook(h.webhookSecret)
	if err != nil {
		h.logger.Printf("ERROR: Failed to create webhook verifier: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "internal server error"})
		return
	}

	var payload map[string]interface{}
	err = wh.Verify(body, headers)
	if err != nil {
		h.logger.Printf("ERROR: Webhook verification failed: %v", err)
		utils.WriteResponseJSON(w, http.StatusUnauthorized, utils.ResponseEnvelope{"error": "invalid webhook signature"})
		return
	}

	//* Parse event
	if err := json.Unmarshal(body, &payload); err != nil {
		h.logger.Printf("ERROR: Failed to parse webhook payload: %v", err)
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid payload"})
		return
	}

	eventType, ok := payload["type"].(string)
	if !ok {
		h.logger.Printf("ERROR: Event type not found in payload")
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid payload"})
		return
	}

	h.logger.Printf("INFO: Received Clerk webhook event: %s", eventType)

	switch eventType {
	case "user.created":
		h.handleUserCreated(payload)
	case "user.updated":
		h.handleUserUpdated(payload)
	case "user.deleted":
		h.handleUserDeleted(payload)
	default:
		h.logger.Printf("INFO: Ignoring unhandled event type: %s", eventType)
	}

	utils.WriteResponseJSON(w, http.StatusOK, utils.ResponseEnvelope{"message": "webhook processed"})
}

func (h *ClerkWebhookHandler) handleUserCreated(event map[string]interface{}) {
	data, ok := event["data"].(map[string]interface{})
	if !ok {
		h.logger.Printf("ERROR: Invalid user.created event data")
		return
	}

	clerkUserID, ok := data["id"].(string)
	if !ok || clerkUserID == "" {
		h.logger.Printf("ERROR: Clerk user ID not found in event")
		return
	}

	//* Extract username
	username := ""
	if un, ok := data["username"].(string); ok && un != "" {
		username = un
	} else if emailAddresses, ok := data["email_addresses"].([]interface{}); ok && len(emailAddresses) > 0 {
		// Fallback to email prefix
		if emailObj, ok := emailAddresses[0].(map[string]interface{}); ok {
			if email, ok := emailObj["email_address"].(string); ok {
				parts := strings.Split(email, "@")
				username = parts[0]
			}
		}
	}

	//* Extract email
	email := ""
	if emailAddresses, ok := data["email_addresses"].([]interface{}); ok && len(emailAddresses) > 0 {
		if emailObj, ok := emailAddresses[0].(map[string]interface{}); ok {
			if emailAddr, ok := emailObj["email_address"].(string); ok {
				email = emailAddr
			}
		}
	}

	if username == "" || email == "" {
		h.logger.Printf("ERROR: Username or email missing for Clerk user: %s", clerkUserID)
		return
	}

	user := &store.User{
		ClerkUserID: clerkUserID,
		Username:    username,
		Email:       email,
	}

	if err := h.userStore.CreateUser(user); err != nil {
		h.logger.Printf("ERROR: Failed to create user for Clerk ID %s: %v", clerkUserID, err)
		return
	}

	h.logger.Printf("INFO: Created local user (ID: %d) for Clerk user: %s", user.ID, clerkUserID)
}

func (h *ClerkWebhookHandler) handleUserUpdated(event map[string]interface{}) {
	data, ok := event["data"].(map[string]interface{})
	if !ok {
		h.logger.Printf("ERROR: Invalid user.updated event data")
		return
	}

	clerkUserID, ok := data["id"].(string)
	if !ok || clerkUserID == "" {
		h.logger.Printf("ERROR: Clerk user ID not found in user.updated event")
		return
	}

	//* Extract updated username
	username := ""
	if un, ok := data["username"].(string); ok && un != "" {
		username = un
	} else if emailAddresses, ok := data["email_addresses"].([]interface{}); ok && len(emailAddresses) > 0 {
		// Fallback to email prefix
		if emailObj, ok := emailAddresses[0].(map[string]interface{}); ok {
			if email, ok := emailObj["email_address"].(string); ok {
				parts := strings.Split(email, "@")
				username = parts[0]
			}
		}
	}

	//* Extract updated email
	email := ""
	if emailAddresses, ok := data["email_addresses"].([]interface{}); ok && len(emailAddresses) > 0 {
		if emailObj, ok := emailAddresses[0].(map[string]interface{}); ok {
			if emailAddr, ok := emailObj["email_address"].(string); ok {
				email = emailAddr
			}
		}
	}

	if username == "" || email == "" {
		h.logger.Printf("ERROR: Username or email missing for Clerk user update: %s", clerkUserID)
		return
	}

	//* Update local user
	if err := h.userStore.UpdateUserByClerkID(clerkUserID, username, email); err != nil {
		h.logger.Printf("ERROR: Failed to update user for Clerk ID %s: %v", clerkUserID, err)
		return
	}

	h.logger.Printf("INFO: Updated local user for Clerk user: %s (username: %s, email: %s)", clerkUserID, username, email)
}

func (h *ClerkWebhookHandler) handleUserDeleted(event map[string]interface{}) {
	data, ok := event["data"].(map[string]interface{})
	if !ok {
		h.logger.Printf("ERROR: Invalid user.deleted event data")
		return
	}

	clerkUserID, ok := data["id"].(string)
	if !ok || clerkUserID == "" {
		h.logger.Printf("ERROR: Clerk user ID not found in user.deleted event")
		return
	}

	//* Delete user from local database (CASCADE DELETE will remove worlds, sessions, etc.)
	if err := h.userStore.DeleteUserByClerkID(clerkUserID); err != nil {
		h.logger.Printf("ERROR: Failed to delete user for Clerk ID %s: %v", clerkUserID, err)
		return
	}

	h.logger.Printf("INFO: Deleted local user for Clerk user: %s (CASCADE DELETE removed all associated data)", clerkUserID)
}
