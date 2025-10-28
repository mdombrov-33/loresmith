package store

import (
	"database/sql"
	"encoding/json"
	"time"
)

type AdventureSession struct {
	ID                int                    `json:"id"`
	WorldID           int                    `json:"world_id"`
	UserID            int                    `json:"user_id"`
	Status            string                 `json:"status"` //* 'initializing', 'active', 'completed', 'failed'
	CurrentSceneIndex int                    `json:"current_scene_index"`
	CurrentAct        int                    `json:"current_act"`
	SessionState      map[string]interface{} `json:"session_state,omitempty"`
	CreatedAt         time.Time              `json:"created_at"`
	UpdatedAt         time.Time              `json:"updated_at"`
	CompletedAt       *time.Time             `json:"completed_at,omitempty"`
}

type AdventureStore interface {
	CreateSession(worldID int, userID int) (int, error)
	GetSessionByID(sessionID int) (*AdventureSession, error)
	GetSessionsByUserID(userID int, status *string) ([]*AdventureSession, error)
	GetSessionsByWorldID(worldID int, status *string) ([]*AdventureSession, error)
	UpdateSessionStatus(sessionID int, status string) error
	UpdateSessionProgress(sessionID int, sceneIndex int, act int) error
	UpdateSessionState(sessionID int, state map[string]interface{}) error
	DeleteSession(sessionID int) error
	CountActiveSessions(worldID int) (int, error)
}

type PostgresAdventureStore struct {
	db *sql.DB
}

func NewPostgresAdventureStore(db *sql.DB) *PostgresAdventureStore {
	return &PostgresAdventureStore{db: db}
}

func (s *PostgresAdventureStore) CreateSession(worldID int, userID int) (int, error) {
	query := `
	INSERT INTO adventure_sessions (world_id, user_id, status, current_scene_index, current_act, created_at, updated_at)
	VALUES ($1, $2, 'initializing', 0, 1, NOW(), NOW())
	RETURNING id
	`
	var sessionID int

	err := s.db.QueryRow(query, worldID, userID).Scan(&sessionID)

	if err != nil {
		return 0, err
	}

	return sessionID, nil
}

func (s *PostgresAdventureStore) GetSessionByID(sessionID int) (*AdventureSession, error) {
	query := `
	SELECT id, world_id, user_id, status, current_scene_index, current_act,
	       session_state, created_at, updated_at, completed_at
	FROM adventure_sessions
	WHERE id = $1
	`
	var session AdventureSession
	var sessionStateJSON sql.NullString //* For nullable JSONB

	err := s.db.QueryRow(query, sessionID).Scan(
		&session.ID,
		&session.WorldID,
		&session.UserID,
		&session.Status,
		&session.CurrentSceneIndex,
		&session.CurrentAct,
		&sessionStateJSON,
		&session.CreatedAt,
		&session.UpdatedAt,
		&session.CompletedAt,
	)

	if err != nil {
		return nil, err
	}

	//* Handle nullable session_state
	if sessionStateJSON.Valid {
		var state map[string]interface{}
		if err := json.Unmarshal([]byte(sessionStateJSON.String), &state); err != nil {
			return nil, err
		}
		session.SessionState = state
	}

	return &session, nil
}

func (s *PostgresAdventureStore) GetSessionsByUserID(userID int, status *string) ([]*AdventureSession, error) {
	query := `
	SELECT id, world_id, user_id, status, current_scene_index, current_act,
	session_state, created_at, updated_at, completed_at
	FROM adventure_sessions
	WHERE user_id = $1
	`
	var rows *sql.Rows
	var err error

	if status != nil {
		query += " AND status = $2 ORDER BY created_at DESC"
		rows, err = s.db.Query(query, userID, *status)
	} else {
		query += " ORDER BY created_at DESC"
		rows, err = s.db.Query(query, userID)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []*AdventureSession

	for rows.Next() {
		var session AdventureSession
		var sessionStateJSON sql.NullString //* For nullable JSONB

		err := rows.Scan(
			&session.ID,
			&session.WorldID,
			&session.UserID,
			&session.Status,
			&session.CurrentSceneIndex,
			&session.CurrentAct,
			&sessionStateJSON,
			&session.CreatedAt,
			&session.UpdatedAt,
			&session.CompletedAt,
		)
		if err != nil {
			return nil, err
		}

		//* Handle nullable session_state
		if sessionStateJSON.Valid {
			var state map[string]interface{}
			if err := json.Unmarshal([]byte(sessionStateJSON.String), &state); err != nil {
				return nil, err
			}
			session.SessionState = state
		}

		sessions = append(sessions, &session)
	}

	return sessions, nil
}

func (s *PostgresAdventureStore) GetSessionsByWorldID(worldID int, status *string) ([]*AdventureSession, error) {
	query := `
	SELECT id, world_id, user_id, status, current_scene_index, current_act,
	session_state, created_at, updated_at, completed_at
	FROM adventure_sessions
	WHERE world_id = $1
	`
	var rows *sql.Rows
	var err error

	if status != nil {
		query += " AND status = $2 ORDER BY created_at DESC"
		rows, err = s.db.Query(query, worldID, *status)
	} else {
		query += " ORDER BY created_at DESC"
		rows, err = s.db.Query(query, worldID)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []*AdventureSession

	for rows.Next() {
		var session AdventureSession
		var sessionStateJSON sql.NullString //* For nullable JSONB

		err := rows.Scan(
			&session.ID,
			&session.WorldID,
			&session.UserID,
			&session.Status,
			&session.CurrentSceneIndex,
			&session.CurrentAct,
			&sessionStateJSON,
			&session.CreatedAt,
			&session.UpdatedAt,
			&session.CompletedAt,
		)
		if err != nil {
			return nil, err
		}

		//* Handle nullable session_state
		if sessionStateJSON.Valid {
			var state map[string]interface{}
			if err := json.Unmarshal([]byte(sessionStateJSON.String), &state); err != nil {
				return nil, err
			}
			session.SessionState = state
		}

		sessions = append(sessions, &session)
	}

	return sessions, nil
}

func (s *PostgresAdventureStore) UpdateSessionStatus(sessionID int, status string) error {
	query := `
	UPDATE adventure_sessions
	SET status = $1,
	    updated_at = NOW(),
	    completed_at = CASE WHEN $1 IN ('completed', 'failed') THEN NOW() ELSE completed_at END
	WHERE id = $2
	`
	_, err := s.db.Exec(query, status, sessionID)
	return err
}

func (s *PostgresAdventureStore) UpdateSessionProgress(sessionID int, sceneIndex int, act int) error {
	query := `
	UPDATE adventure_sessions
	SET current_scene_index = $1,
	    current_act = $2,
	    updated_at = NOW()
	WHERE id = $3
	`
	_, err := s.db.Exec(query, sceneIndex, act, sessionID)
	return err
}

func (s *PostgresAdventureStore) UpdateSessionState(sessionID int, state map[string]interface{}) error {
	stateJSON, err := json.Marshal(state)
	if err != nil {
		return err
	}
	query := `
	UPDATE adventure_sessions
	SET session_state = $1, updated_at = NOW()
	WHERE id = $2
	`
	_, err = s.db.Exec(query, stateJSON, sessionID)
	return err
}

func (s *PostgresAdventureStore) DeleteSession(sessionID int) error {
	query := `
	DELETE FROM adventure_sessions
	WHERE id = $1
	`
	_, err := s.db.Exec(query, sessionID)
	return err
}

func (s *PostgresAdventureStore) CountActiveSessions(worldID int) (int, error) {
	query := `
	SELECT COUNT(*) FROM adventure_sessions
	WHERE world_id = $1 AND status = 'active'
	`
	var count int
	err := s.db.QueryRow(query, worldID).Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}
