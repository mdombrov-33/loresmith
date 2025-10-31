package api

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/mdombrov-33/loresmith/go-service/internal/middleware"
	"github.com/mdombrov-33/loresmith/go-service/internal/store"
	"github.com/mdombrov-33/loresmith/go-service/internal/utils"
)

type AdventureHandler struct {
	adventureStore store.AdventureStore
	partyStore     store.PartyStore
	worldStore     store.WorldStore
	logger         *log.Logger
}

func NewAdventureHandler(
	adventureStore store.AdventureStore,
	partyStore store.PartyStore,
	worldStore store.WorldStore,
	logger *log.Logger,
) *AdventureHandler {
	return &AdventureHandler{
		adventureStore: adventureStore,
		partyStore:     partyStore,
		worldStore:     worldStore,
		logger:         logger,
	}
}

func (h *AdventureHandler) HandleCheckActiveSession(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteResponseJSON(w, http.StatusMethodNotAllowed, utils.ResponseEnvelope{"error": "method not allowed"})
		return
	}

	currentUser := middleware.GetUser(r)

	worldIDStr := chi.URLParam(r, "id")
	worldID, err := strconv.Atoi(worldIDStr)
	if err != nil {
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid world ID"})
		return
	}

	activeSession, err := h.adventureStore.GetActiveSessionForWorld(worldID, int(currentUser.ID))
	if err != nil {
		h.logger.Printf("ERROR: failed to check active session: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "failed to check session"})
		return
	}

	if activeSession == nil {
		utils.WriteResponseJSON(w, http.StatusOK, utils.ResponseEnvelope{
			"has_active_session": false,
			"session":            nil,
		})
	} else {
		utils.WriteResponseJSON(w, http.StatusOK, utils.ResponseEnvelope{
			"has_active_session": true,
			"session":            activeSession,
		})
	}
}

func (h *AdventureHandler) HandleStartAdventure(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteResponseJSON(w, http.StatusMethodNotAllowed, utils.ResponseEnvelope{"error": "method not allowed"})
		return
	}

	currentUser := middleware.GetUser(r)

	worldIDStr := chi.URLParam(r, "id")
	worldID, err := strconv.Atoi(worldIDStr)
	if err != nil {
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid world ID"})
		return
	}

	world, err := h.worldStore.GetWorldById(worldID)
	if err != nil {
		h.logger.Printf("ERROR: failed to get world: %v", err)
		utils.WriteResponseJSON(w, http.StatusNotFound, utils.ResponseEnvelope{"error": "world not found"})
		return
	}

	sessionID, err := h.adventureStore.CreateSession(worldID, int(currentUser.ID))
	if err != nil {
		h.logger.Printf("ERROR: failed to create session: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "failed to create adventure session"})
		return
	}

	protagonistLore, err := h.worldStore.GetProtagonistForWorld(worldID)
	if err != nil {
		h.logger.Printf("ERROR: failed to get protagonist: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "protagonist character not found"})
		return
	}

	protagonist := &store.PartyMember{
		SessionID:                 sessionID,
		LoreCharacterID:           int64Ptr(int64(protagonistLore.ID)),
		IsProtagonist:             true,
		Name:                      protagonistLore.Name,
		Description:               protagonistLore.Description,
		RelationshipToProtagonist: nil, //* NULL for protagonist
		MaxHP:                     parseIntFromDetails(protagonistLore.Details, "health", 100),
		CurrentHP:                 parseIntFromDetails(protagonistLore.Details, "health", 100),
		Stress:                    parseIntFromDetails(protagonistLore.Details, "stress", 0),
		LoreMastery:               parseIntFromDetails(protagonistLore.Details, "lore_mastery", 10),
		Empathy:                   parseIntFromDetails(protagonistLore.Details, "empathy", 10),
		Resilience:                parseIntFromDetails(protagonistLore.Details, "resilience", 10),
		Creativity:                parseIntFromDetails(protagonistLore.Details, "creativity", 10),
		Influence:                 parseIntFromDetails(protagonistLore.Details, "influence", 10),
		Perception:                parseIntFromDetails(protagonistLore.Details, "perception", 10),
		Skills:                    protagonistLore.Details["skills"],
		Flaw:                      protagonistLore.Details["flaw"],
		Personality:               protagonistLore.Details["personality"],
		Appearance:                protagonistLore.Details["appearance"],
		Position:                  0, //* Protagonist is always position 0
	}

	protagonistID, err := h.partyStore.CreatePartyMember(protagonist)
	if err != nil {
		h.logger.Printf("ERROR: failed to create protagonist party member: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "failed to create party"})
		return
	}
	protagonist.ID = protagonistID

	if world.Status == "draft" {
		err = h.worldStore.UpdateWorldStatus(worldID, "active")
		if err != nil {
			h.logger.Printf("WARN: failed to update world status: %v", err)
		}
	}

	utils.WriteResponseJSON(w, http.StatusCreated, utils.ResponseEnvelope{
		"session_id":  sessionID,
		"protagonist": protagonist,
	})
}

func (h *AdventureHandler) HandleGetAdventureState(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteResponseJSON(w, http.StatusMethodNotAllowed, utils.ResponseEnvelope{"error": "method not allowed"})
		return
	}

	sessionIDStr := chi.URLParam(r, "session_id")
	sessionID, err := strconv.Atoi(sessionIDStr)
	if err != nil {
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid session_id"})
		return
	}

	currentUser := middleware.GetUser(r)

	session, err := h.adventureStore.GetSessionByID(sessionID)
	if err != nil {
		h.logger.Printf("ERROR: failed to get session: %v", err)
		utils.WriteResponseJSON(w, http.StatusNotFound, utils.ResponseEnvelope{"error": "session not found"})
		return
	}

	if session.UserID != int(currentUser.ID) {
		utils.WriteResponseJSON(w, http.StatusForbidden, utils.ResponseEnvelope{"error": "not authorized to access this session"})
		return
	}

	party, err := h.partyStore.GetPartyBySessionID(sessionID)
	if err != nil {
		h.logger.Printf("ERROR: failed to get party: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "failed to get party"})
		return
	}

	world, err := h.worldStore.GetWorldById(session.WorldID)
	if err != nil {
		h.logger.Printf("ERROR: failed to get world: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "failed to get world"})
		return
	}

	utils.WriteResponseJSON(w, http.StatusOK, utils.ResponseEnvelope{
		"session": session,
		"party":   party,
		"world":   world,
	})
}

func (h *AdventureHandler) HandleUpdateSessionProgress(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteResponseJSON(w, http.StatusMethodNotAllowed, utils.ResponseEnvelope{"error": "method not allowed"})
		return
	}

	sessionIDStr := chi.URLParam(r, "session_id")
	sessionID, err := strconv.Atoi(sessionIDStr)
	if err != nil {
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid session_id"})
		return
	}

	var req struct {
		SceneIndex int `json:"scene_index"`
		Act        int `json:"act"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid JSON body"})
		return
	}

	currentUser := middleware.GetUser(r)

	session, err := h.adventureStore.GetSessionByID(sessionID)
	if err != nil {
		utils.WriteResponseJSON(w, http.StatusNotFound, utils.ResponseEnvelope{"error": "session not found"})
		return
	}

	if session.UserID != int(currentUser.ID) {
		utils.WriteResponseJSON(w, http.StatusForbidden, utils.ResponseEnvelope{"error": "not authorized"})
		return
	}

	err = h.adventureStore.UpdateSessionProgress(sessionID, req.SceneIndex, req.Act)
	if err != nil {
		h.logger.Printf("ERROR: failed to update session progress: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "failed to update progress"})
		return
	}

	utils.WriteResponseJSON(w, http.StatusOK, utils.ResponseEnvelope{"success": true})
}

func (h *AdventureHandler) HandleUpdatePartyStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteResponseJSON(w, http.StatusMethodNotAllowed, utils.ResponseEnvelope{"error": "method not allowed"})
		return
	}

	var req struct {
		PartyMemberID int `json:"party_member_id"`
		CurrentHP     int `json:"current_hp"`
		Stress        int `json:"stress"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid JSON body"})
		return
	}

	member, err := h.partyStore.GetPartyMemberByID(req.PartyMemberID)
	if err != nil {
		utils.WriteResponseJSON(w, http.StatusNotFound, utils.ResponseEnvelope{"error": "party member not found"})
		return
	}

	currentUser := middleware.GetUser(r)
	session, err := h.adventureStore.GetSessionByID(member.SessionID)
	if err != nil || session.UserID != int(currentUser.ID) {
		utils.WriteResponseJSON(w, http.StatusForbidden, utils.ResponseEnvelope{"error": "not authorized"})
		return
	}

	err = h.partyStore.UpdatePartyMemberStats(req.PartyMemberID, req.CurrentHP, req.Stress)
	if err != nil {
		h.logger.Printf("ERROR: failed to update party member stats: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "failed to update stats"})
		return
	}

	utils.WriteResponseJSON(w, http.StatusOK, utils.ResponseEnvelope{"success": true})
}

func (h *AdventureHandler) HandleGetParty(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteResponseJSON(w, http.StatusMethodNotAllowed, utils.ResponseEnvelope{"error": "method not allowed"})
		return
	}

	sessionIDStr := chi.URLParam(r, "session_id")
	sessionID, err := strconv.Atoi(sessionIDStr)
	if err != nil {
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid session_id"})
		return
	}

	currentUser := middleware.GetUser(r)

	session, err := h.adventureStore.GetSessionByID(sessionID)
	if err != nil {
		utils.WriteResponseJSON(w, http.StatusNotFound, utils.ResponseEnvelope{"error": "session not found"})
		return
	}

	if session.UserID != int(currentUser.ID) {
		utils.WriteResponseJSON(w, http.StatusForbidden, utils.ResponseEnvelope{"error": "not authorized"})
		return
	}

	party, err := h.partyStore.GetPartyBySessionID(sessionID)
	if err != nil {
		h.logger.Printf("ERROR: failed to get party: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "failed to get party"})
		return
	}

	utils.WriteResponseJSON(w, http.StatusOK, utils.ResponseEnvelope{
		"party": party,
	})
}

func (h *AdventureHandler) HandleDeleteSession(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		utils.WriteResponseJSON(w, http.StatusMethodNotAllowed, utils.ResponseEnvelope{"error": "method not allowed"})
		return
	}

	sessionIDStr := chi.URLParam(r, "session_id")
	sessionID, err := strconv.Atoi(sessionIDStr)
	if err != nil {
		utils.WriteResponseJSON(w, http.StatusBadRequest, utils.ResponseEnvelope{"error": "invalid session_id"})
		return
	}

	currentUser := middleware.GetUser(r)

	session, err := h.adventureStore.GetSessionByID(sessionID)
	if err != nil {
		utils.WriteResponseJSON(w, http.StatusNotFound, utils.ResponseEnvelope{"error": "session not found"})
		return
	}

	if session.UserID != int(currentUser.ID) {
		utils.WriteResponseJSON(w, http.StatusForbidden, utils.ResponseEnvelope{"error": "not authorized"})
		return
	}

	err = h.adventureStore.DeleteSession(sessionID)
	if err != nil {
		h.logger.Printf("ERROR: failed to delete session: %v", err)
		utils.WriteResponseJSON(w, http.StatusInternalServerError, utils.ResponseEnvelope{"error": "failed to delete session"})
		return
	}

	activeSessions, err := h.adventureStore.CountActiveSessions(session.WorldID)
	if err != nil {
		h.logger.Printf("WARN: failed to count active sessions: %v", err)
	}

	if activeSessions == 0 {
		err = h.worldStore.UpdateWorldStatus(session.WorldID, "draft")
		if err != nil {
			h.logger.Printf("WARN: failed to update world status: %v", err)
		}
	}

	utils.WriteResponseJSON(w, http.StatusOK, utils.ResponseEnvelope{"success": true})
}

// * int64Ptr returns a pointer to an int64
func int64Ptr(i int64) *int64 {
	return &i
}

// * parseIntFromDetails parses an int from the lore details map with a default fallback
func parseIntFromDetails(details map[string]string, key string, defaultVal int) int {
	if val, ok := details[key]; ok {
		if parsed, err := strconv.Atoi(val); err == nil {
			return parsed
		}
	}
	return defaultVal
}
