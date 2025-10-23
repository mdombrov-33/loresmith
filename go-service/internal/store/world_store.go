package store

import (
	"database/sql"
	"encoding/json"
	"strconv"
	"time"

	"github.com/mdombrov-33/loresmith/go-service/gen/lorepb"
)

type World struct {
	ID         int          `json:"id"`
	UserID     int          `json:"user_id"`
	UserName   *string      `json:"user_name,omitempty"`
	Status     string       `json:"status"`
	Theme      string       `json:"theme"`
	FullStory  string       `json:"full_story"`
	LorePieces []*LorePiece `json:"lore_pieces,omitempty"`
	CreatedAt  time.Time    `json:"created_at"`
	UpdatedAt  time.Time    `json:"updated_at"`
}

type LorePiece struct {
	ID          int               `json:"id"`
	WorldID     int               `json:"world_id"`
	Type        string            `json:"type"`
	Name        string            `json:"name"`
	Description string            `json:"description"`
	Details     map[string]string `json:"details"`
	CreatedAt   time.Time         `json:"created_at"`
}

type WorldStore interface {
	CreateWorld(userID int, theme string, story *lorepb.FullStory, status string) (int, error)
	GetWorld(worldID int) (*World, error)
	GetWorldsByStatus(status string) ([]*World, error)
	GetWorldsWithFilters(userID *int, theme *string, status *string, includeUserName bool) ([]*World, error)
}

type PostgresWorldStore struct {
	db *sql.DB
}

func NewPostgresWorldStore(db *sql.DB) *PostgresWorldStore {
	return &PostgresWorldStore{db: db}
}

func (s *PostgresWorldStore) CreateWorld(userID int, theme string, story *lorepb.FullStory, status string) (int, error) {
	tx, err := s.db.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	storyJSON, err := json.Marshal(story)
	if err != nil {
		return 0, err
	}

	var worldID int
	err = tx.QueryRow(`
        INSERT INTO worlds (user_id, status, theme, full_story, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING id
    `, userID, status, theme, string(storyJSON)).Scan(&worldID)
	if err != nil {
		return 0, err
	}

	for _, piece := range []struct {
		pieceType string
		piece     *lorepb.LorePiece
	}{
		{"character", story.Pieces.Character},
		{"faction", story.Pieces.Faction},
		{"setting", story.Pieces.Setting},
		{"event", story.Pieces.Event},
		{"relic", story.Pieces.Relic},
	} {
		if piece.piece != nil {
			detailsJSON, _ := json.Marshal(piece.piece.Details)
			_, err = tx.Exec(`
                INSERT INTO lore_pieces (world_id, type, name, description, details, created_at)
                VALUES ($1, $2, $3, $4, $5, NOW())
            `, worldID, piece.pieceType, piece.piece.Name, piece.piece.Description, string(detailsJSON))
			if err != nil {
				return 0, err
			}
		}
	}

	err = tx.Commit()
	if err != nil {
		return 0, err
	}

	return worldID, nil
}

func (s *PostgresWorldStore) GetWorld(worldID int) (*World, error) {
	var world World
	err := s.db.QueryRow(`
        SELECT id, user_id, status, theme, full_story, created_at, updated_at
        FROM worlds WHERE id = $1
    `, worldID).Scan(&world.ID, &world.UserID, &world.Status, &world.Theme, &world.FullStory, &world.CreatedAt, &world.UpdatedAt)
	if err != nil {
		return nil, err
	}

	rows, err := s.db.Query(`
        SELECT id, world_id, type, name, description, details, created_at
        FROM lore_pieces WHERE world_id = $1
    `, worldID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lorePieces []*LorePiece
	for rows.Next() {
		var piece LorePiece
		var detailsJSON string
		err := rows.Scan(&piece.ID, &piece.WorldID, &piece.Type, &piece.Name, &piece.Description, &detailsJSON, &piece.CreatedAt)
		if err != nil {
			return nil, err
		}
		if detailsJSON != "" {
			json.Unmarshal([]byte(detailsJSON), &piece.Details)
		}
		lorePieces = append(lorePieces, &piece)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}

	world.LorePieces = lorePieces
	return &world, nil
}

func (s *PostgresWorldStore) GetWorldsByStatus(status string) ([]*World, error) {
	rows, err := s.db.Query(`
        SELECT id, user_id, status, theme, full_story, created_at, updated_at
        FROM worlds WHERE status = $1
    `, status)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var worlds []*World
	for rows.Next() {
		var world World
		err := rows.Scan(&world.ID, &world.UserID, &world.Status, &world.Theme, &world.FullStory, &world.CreatedAt, &world.UpdatedAt)
		if err != nil {
			return nil, err
		}
		worlds = append(worlds, &world)
	}
	return worlds, nil
}

func (s *PostgresWorldStore) GetWorldsWithFilters(userID *int, theme *string, status *string, includeUserName bool) ([]*World, error) {
	var query string
	var args []interface{}
	argCount := 0

	if includeUserName {
		query = `
        SELECT w.id, w.user_id, u.username as user_name, w.status, w.theme, w.full_story, w.created_at, w.updated_at
        FROM worlds w
        JOIN users u ON w.user_id = u.id
        WHERE 1=1`
	} else {
		query = `
        SELECT id, user_id, NULL as user_name, status, theme, full_story, created_at, updated_at
        FROM worlds WHERE 1=1`
	}

	if userID != nil {
		argCount++
		query += ` AND user_id = $` + strconv.Itoa(argCount)
		args = append(args, *userID)
	}
	if theme != nil {
		argCount++
		query += ` AND theme = $` + strconv.Itoa(argCount)
		args = append(args, *theme)
	}
	if status != nil {
		argCount++
		query += ` AND status = $` + strconv.Itoa(argCount)
		args = append(args, *status)
	}

	query += ` ORDER BY created_at DESC`

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var worlds []*World
	for rows.Next() {
		var world World
		err := rows.Scan(&world.ID, &world.UserID, &world.UserName, &world.Status, &world.Theme, &world.FullStory, &world.CreatedAt, &world.UpdatedAt)
		if err != nil {
			return nil, err
		}
		worlds = append(worlds, &world)
	}
	return worlds, nil
}
