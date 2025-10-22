package store

import (
	"database/sql"
	"encoding/json"
	"time"

	"github.com/mdombrov-33/loresmith/go-service/gen/lorepb"
)

type World struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	Status    string    `json:"status"`
	Theme     string    `json:"theme"`
	FullStory string    `json:"full_story"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type LorePiece struct {
	ID          int                    `json:"id"`
	WorldID     int                    `json:"world_id"`
	Type        string                 `json:"type"`
	Name        string                 `json:"name"`
	Description *string                `json:"description"`
	Details     map[string]interface{} `json:"details"`
	CreatedAt   time.Time              `json:"created_at"`
}

type WorldStore interface {
	CreateWorld(userID int, theme string, story *lorepb.FullStory, status string) (int, error)
	GetWorld(worldID int) (*World, error)
	GetWorldsByStatus(status string) ([]*World, error)
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

	pieces := []*lorepb.LorePiece{story.Pieces.Character, story.Pieces.Faction, story.Pieces.Setting, story.Pieces.Event, story.Pieces.Relic}
	for _, piecePtr := range pieces {
		if piecePtr == nil {
			continue
		}
		detailsJSON, _ := json.Marshal(piecePtr.Details)
		_, err = tx.Exec(`
            INSERT INTO lore_pieces (world_id, type, name, description, details, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
        `, worldID, piecePtr.Type, piecePtr.Name, piecePtr.Description, string(detailsJSON))
		if err != nil {
			return 0, err
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
