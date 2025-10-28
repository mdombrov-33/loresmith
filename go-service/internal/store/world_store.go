package store

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/mdombrov-33/loresmith/go-service/gen/lorepb"
	"github.com/pgvector/pgvector-go"
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
	Relevance  *float64     `json:"relevance,omitempty"`
	Embedding  []float32    `json:"embedding,omitempty"`
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
	CreateWorldWithEmbedding(userID int, theme string, story *lorepb.FullStory, status string, embedding []float32) (int, error)
	GetWorldById(worldID int) (*World, error)
	GetWorldsByFilters(userID *int, theme *string, status *string, includeUserName bool, limit int, offset int) ([]*World, int, error)
	SearchWorldsByEmbedding(embedding []float32, userID *int, theme *string, status *string, includeUserName bool, limit int, offset int) ([]*World, int, error)
	DeleteWorldById(worldID int) error
}

type PostgresWorldStore struct {
	db *sql.DB
}

func NewPostgresWorldStore(db *sql.DB) *PostgresWorldStore {
	return &PostgresWorldStore{db: db}
}

func (s *PostgresWorldStore) CreateWorld(userID int, theme string, story *lorepb.FullStory, status string) (int, error) {
	return s.CreateWorldWithEmbedding(userID, theme, story, status, nil)
}

func (s *PostgresWorldStore) CreateWorldWithEmbedding(userID int, theme string, story *lorepb.FullStory, status string, embedding []float32) (int, error) {
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
	var query string
	var args []interface{}

	if len(embedding) > 0 {
		vec := pgvector.NewVector(embedding)
		provider := os.Getenv("AI_PROVIDER")
		var column string
		if provider == "local" {
			column = "embedding_local"
		} else {
			column = "embedding_prod"
		}
		query = fmt.Sprintf(`
			INSERT INTO worlds (user_id, status, theme, full_story, %s, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
			RETURNING id
		`, column)
		args = []interface{}{userID, status, theme, string(storyJSON), vec}
	} else {
		query = `
			INSERT INTO worlds (user_id, status, theme, full_story, created_at, updated_at)
			VALUES ($1, $2, $3, $4, NOW(), NOW())
			RETURNING id
		`
		args = []interface{}{userID, status, theme, string(storyJSON)}
	}

	err = tx.QueryRow(query, args...).Scan(&worldID)
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
			if piece.pieceType == "character" {
				if piece.piece.Details == nil {
					piece.piece.Details = make(map[string]string)
				}
				piece.piece.Details["is_protagonist"] = "true"
			}

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

func (s *PostgresWorldStore) GetWorldById(worldID int) (*World, error) {
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

func (s *PostgresWorldStore) GetWorldsByFilters(userID *int, theme *string, status *string, includeUserName bool, limit int, offset int) ([]*World, int, error) {
	var query string
	var countQuery string
	args := []interface{}{}
	countArgs := []interface{}{}
	argCount := 0
	countArgCount := 0

	if includeUserName {
		query = `
        SELECT w.id, w.user_id, u.username as user_name, w.status, w.theme, w.full_story, w.created_at, w.updated_at
        FROM worlds w
        JOIN users u ON w.user_id = u.id
        WHERE 1=1`
		countQuery = `
        SELECT COUNT(*)
        FROM worlds w
        JOIN users u ON w.user_id = u.id
        WHERE 1=1`
	} else {
		query = `
        SELECT id, user_id, NULL as user_name, status, theme, full_story, created_at, updated_at
        FROM worlds WHERE 1=1`
		countQuery = `
        SELECT COUNT(*)
        FROM worlds WHERE 1=1`
	}

	if userID != nil {
		argCount++
		countArgCount++
		query += ` AND user_id = $` + strconv.Itoa(argCount)
		countQuery += ` AND user_id = $` + strconv.Itoa(countArgCount)
		args = append(args, *userID)
		countArgs = append(countArgs, *userID)
	}
	if theme != nil {
		argCount++
		countArgCount++
		query += ` AND theme = $` + strconv.Itoa(argCount)
		countQuery += ` AND theme = $` + strconv.Itoa(countArgCount)
		args = append(args, *theme)
		countArgs = append(countArgs, *theme)
	}
	if status != nil {
		argCount++
		countArgCount++
		query += ` AND status = $` + strconv.Itoa(argCount)
		countQuery += ` AND status = $` + strconv.Itoa(countArgCount)
		args = append(args, *status)
		countArgs = append(countArgs, *status)
	}

	query += ` ORDER BY created_at DESC LIMIT $` + strconv.Itoa(argCount+1) + ` OFFSET $` + strconv.Itoa(argCount+2)
	args = append(args, limit, offset)

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var worlds []*World
	for rows.Next() {
		var world World
		err := rows.Scan(&world.ID, &world.UserID, &world.UserName, &world.Status, &world.Theme, &world.FullStory, &world.CreatedAt, &world.UpdatedAt)
		if err != nil {
			return nil, 0, err
		}
		worlds = append(worlds, &world)
	}

	var total int
	err = s.db.QueryRow(countQuery, countArgs...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	return worlds, total, nil
}

func (s *PostgresWorldStore) SearchWorldsByEmbedding(embedding []float32, userID *int, theme *string, status *string, includeUserName bool, limit int, offset int) ([]*World, int, error) {
	if len(embedding) == 0 {
		return nil, 0, fmt.Errorf("embedding cannot be empty")
	}

	vec := pgvector.NewVector(embedding)
	provider := os.Getenv("AI_PROVIDER")
	var column string
	if provider == "local" {
		column = "embedding_local"
	} else {
		column = "embedding_prod"
	}

	var query string
	var countQuery string
	args := []interface{}{}
	countArgs := []interface{}{}
	argCount := 0
	countArgCount := 0

	//* Append vec first
	args = append(args, vec)
	argCount = 1 //* vec is $1

	if includeUserName {
		query = fmt.Sprintf(`
		SELECT w.id, w.user_id, u.username as user_name, w.status, w.theme, w.full_story, w.created_at, w.updated_at, (1 - (%s <=> $1))::float8 as relevance, w.%s as embedding
		FROM worlds w
		JOIN users u ON w.user_id = u.id
		WHERE w.%s IS NOT NULL`, column, column, column)
		countQuery = fmt.Sprintf(`
		SELECT COUNT(*)
		FROM worlds w
		JOIN users u ON w.user_id = u.id
		WHERE w.%s IS NOT NULL`, column)
	} else {
		query = fmt.Sprintf(`
		SELECT id, user_id, NULL as user_name, status, theme, full_story, created_at, updated_at, (1 - (%s <=> $1))::float8 as relevance, %s as embedding
		FROM worlds WHERE %s IS NOT NULL`, column, column, column)
		countQuery = fmt.Sprintf(`
		SELECT COUNT(*)
		FROM worlds WHERE %s IS NOT NULL`, column)
	}

	if userID != nil {
		argCount++
		countArgCount++
		query += ` AND user_id = $` + strconv.Itoa(argCount)
		countQuery += ` AND user_id = $` + strconv.Itoa(countArgCount)
		args = append(args, *userID)
		countArgs = append(countArgs, *userID)
	}
	if theme != nil {
		argCount++
		countArgCount++
		query += ` AND theme = $` + strconv.Itoa(argCount)
		countQuery += ` AND theme = $` + strconv.Itoa(countArgCount)
		args = append(args, *theme)
		countArgs = append(countArgs, *theme)
	}
	if status != nil {
		argCount++
		countArgCount++
		query += ` AND status = $` + strconv.Itoa(argCount)
		countQuery += ` AND status = $` + strconv.Itoa(countArgCount)
		args = append(args, *status)
		countArgs = append(countArgs, *status)
	}

	query += ` ORDER BY relevance DESC LIMIT $` + strconv.Itoa(argCount+1) + ` OFFSET $` + strconv.Itoa(argCount+2)
	args = append(args, limit, offset)

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("search query failed: %w", err)
	}
	defer rows.Close()

	var worlds []*World
	for rows.Next() {
		var world World
		var embedding pgvector.Vector
		err := rows.Scan(
			&world.ID,
			&world.UserID,
			&world.UserName,
			&world.Status,
			&world.Theme,
			&world.FullStory,
			&world.CreatedAt,
			&world.UpdatedAt,
			&world.Relevance,
			&embedding,
		)
		if err != nil {
			return nil, 0, err
		}
		if embedding.Slice() != nil {
			world.Embedding = embedding.Slice()
		}
		worlds = append(worlds, &world)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, err
	}

	var total int
	err = s.db.QueryRow(countQuery, countArgs...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	return worlds, total, nil
}

func (s *PostgresWorldStore) DeleteWorldById(worldID int) error {
	_, err := s.db.Exec(`DELETE FROM worlds WHERE id = $1`, worldID)
	return err
}
