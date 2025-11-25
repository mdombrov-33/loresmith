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
	ID             int             `json:"id"`
	UserID         int             `json:"user_id"`
	UserName       *string         `json:"user_name,omitempty"`
	Status         string          `json:"status"`
	Theme          string          `json:"theme"`
	FullStory      json.RawMessage `json:"full_story"`
	LorePieces     []*LorePiece    `json:"lore_pieces,omitempty"`
	SessionID      *int            `json:"session_id,omitempty"`
	ActiveSessions *int            `json:"active_sessions,omitempty"`
	PortraitURL    *string         `json:"portrait_url,omitempty"`
	Visibility     string          `json:"visibility"`
	Rating         *float64        `json:"rating,omitempty"`
	UserRating     *int            `json:"user_rating,omitempty"`
	RatingCount    *int            `json:"rating_count,omitempty"`
	CreatedAt      time.Time       `json:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at"`
	Relevance      *float64        `json:"relevance,omitempty"`
	Embedding      []float32       `json:"embedding,omitempty"`
}

type LorePiece struct {
	ID          int                    `json:"id"`
	WorldID     int                    `json:"world_id"`
	Type        string                 `json:"type"`
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	Details     map[string]interface{} `json:"details"`
	CreatedAt   time.Time              `json:"created_at"`
}

type WorldStore interface {
	CreateWorld(userID int, theme string, story *lorepb.FullStory, status string) (int, error)
	CreateWorldWithEmbedding(userID int, theme string, story *lorepb.FullStory, status string, embedding []float32) (int, error)
	GetWorldById(worldID int) (*World, error)
	GetWorldsByFilters(userID *int, theme *string, status *string, includeUserName bool, currentUserID int, limit int, offset int, sortBy *string) ([]*World, int, error)
	SearchWorldsByEmbedding(embedding []float32, userID *int, theme *string, status *string, includeUserName bool, currentUserID int, limit int, offset int) ([]*World, int, error)
	DeleteWorldById(worldID int) error
	GetProtagonistForWorld(worldID int) (*LorePiece, error)
	UpdateWorldStatus(worldID int, status string) error
	UpdateWorldVisibility(worldID int, visibility string) error
	UpdateLorePieceDetails(pieceID int, details map[string]interface{}) error
	RateWorld(userID int, worldID int, rating int) error
	GetWorldRating(worldID int) (*float64, *int, error)
	GetUserRating(userID int, worldID int) (*int, error)
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

	//* Create a version of the story WITHOUT pieces for the full_story column
	//* Pieces are stored separately in the lore_pieces table to avoid duplication
	//* and allow updates (like R2 URLs) without modifying the full_story JSON
	storyForDB := &lorepb.FullStory{
		Content: story.Content,
		Theme:   story.Theme,
		Quest:   story.Quest,
		Pieces:  nil, // Don't store pieces in full_story - they go in lore_pieces table
	}

	storyJSON, err := json.Marshal(storyForDB)
	if err != nil {
		return 0, err
	}

	var worldID int
	var query string
	var args []interface{}

	if len(embedding) > 0 {
		vec := pgvector.NewVector(embedding)
		provider := os.Getenv("AI_PROVIDER") //TODO: I don't think I see ai provider column filled in when we create world
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
		args = []interface{}{userID, status, theme, storyJSON, vec}
	} else {
		query = `
			INSERT INTO worlds (user_id, status, theme, full_story, created_at, updated_at)
			VALUES ($1, $2, $3, $4, NOW(), NOW())
			RETURNING id
		`
		args = []interface{}{userID, status, theme, storyJSON}
	}

	err = tx.QueryRow(query, args...).Scan(&worldID)
	if err != nil {
		return 0, err
	}

	//* Store lore pieces with their IDs for later R2 upload
	type savedPiece struct {
		id          int
		pieceType   string
		grpcPiece   *lorepb.LorePiece
		detailsMap  map[string]interface{}
	}
	var savedPieces []savedPiece

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

			//* Deserialize any JSON strings in Details (e.g., skills array)
			//* before marshaling to JSONB for database storage
			detailsMap := make(map[string]interface{})
			for key, value := range piece.piece.Details {
				var parsed interface{}
				if err := json.Unmarshal([]byte(value), &parsed); err == nil {
					//* Successfully parsed as JSON - use the parsed value
					//* This converts "10" -> 10, "[...]" -> array, etc.
					detailsMap[key] = parsed
				} else {
					//* Not valid JSON - keep as plain string
					//* This handles values like "Compulsive repairer" that aren't JSON
					detailsMap[key] = value
				}
			}

			detailsJSON, _ := json.Marshal(detailsMap)
			var pieceID int
			err = tx.QueryRow(`
				INSERT INTO lore_pieces (world_id, type, name, description, details, created_at)
				VALUES ($1, $2, $3, $4, $5, NOW())
				RETURNING id
			`, worldID, piece.pieceType, piece.piece.Name, piece.piece.Description, string(detailsJSON)).Scan(&pieceID)
			if err != nil {
				return 0, err
			}

			//* Store for R2 upload after commit
			savedPieces = append(savedPieces, savedPiece{
				id:         pieceID,
				pieceType:  piece.pieceType,
				grpcPiece:  piece.piece,
				detailsMap: detailsMap,
			})
		}
	}

	err = tx.Commit()
	if err != nil {
		return 0, err
	}

	//* After successful commit, handle R2 uploads for character portraits
	//* This happens outside the transaction to avoid blocking DB commits on image uploads
	for _, saved := range savedPieces {
		if saved.pieceType == "character" {
			//* Check if character has base64 image to upload
			if base64Data, ok := saved.detailsMap["image_portrait_base64"].(string); ok && base64Data != "" {
				//* Note: R2 upload will be handled by the handler after this returns
				//* We keep the base64 in the database temporarily
				//* The handler will call UploadImageToR2 and update the lore piece
			}
		}
	}

	return worldID, nil
}

func (s *PostgresWorldStore) GetWorldById(worldID int) (*World, error) {
	var world World
	err := s.db.QueryRow(`
        SELECT id, user_id, status, theme, full_story, visibility, created_at, updated_at
        FROM worlds WHERE id = $1
    `, worldID).Scan(&world.ID, &world.UserID, &world.Status, &world.Theme, &world.FullStory, &world.Visibility, &world.CreatedAt, &world.UpdatedAt)
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

func (s *PostgresWorldStore) GetWorldsByFilters(userID *int, theme *string, status *string, includeUserName bool, currentUserID int, limit int, offset int, sortBy *string) ([]*World, int, error) {
	var query string
	var countQuery string
	args := []interface{}{}
	countArgs := []interface{}{}
	argCount := 0
	countArgCount := 0

	if includeUserName {
		query = fmt.Sprintf(`
        SELECT w.id, w.user_id, u.username as user_name, w.status, w.theme, w.full_story,
               (SELECT id FROM adventure_sessions
                WHERE world_id = w.id AND user_id = %d AND status IN ('initializing', 'active')
                ORDER BY created_at DESC LIMIT 1) as session_id,
               w.visibility, w.created_at, w.updated_at,
               lp.details->>'image_portrait' as portrait_url,
               w.rating,
               (SELECT COUNT(DISTINCT user_id) FROM adventure_sessions
                WHERE world_id = w.id AND status IN ('initializing', 'active')) as active_sessions_count
        FROM worlds w
        JOIN users u ON w.user_id = u.id
        LEFT JOIN lore_pieces lp ON w.id = lp.world_id AND lp.type = 'character'
        WHERE 1=1`, currentUserID)
		countQuery = `
        SELECT COUNT(*)
        FROM worlds w
        JOIN users u ON w.user_id = u.id
        WHERE 1=1`
	} else {
		query = fmt.Sprintf(`
        SELECT w.id, w.user_id, NULL as user_name, w.status, w.theme, w.full_story,
               (SELECT id FROM adventure_sessions
                WHERE world_id = w.id AND user_id = %d AND status IN ('initializing', 'active')
                ORDER BY created_at DESC LIMIT 1) as session_id,
               w.visibility, w.created_at, w.updated_at,
               lp.details->>'image_portrait' as portrait_url,
               w.rating,
               (SELECT COUNT(DISTINCT user_id) FROM adventure_sessions
                WHERE world_id = w.id AND status IN ('initializing', 'active')) as active_sessions_count
        FROM worlds w
        LEFT JOIN lore_pieces lp ON w.id = lp.world_id AND lp.type = 'character'
        WHERE 1=1`, currentUserID)
		countQuery = `
        SELECT COUNT(*)
        FROM worlds WHERE 1=1`
	}

	if userID != nil {
		argCount++
		countArgCount++
		//* Include both worlds owned by user AND worlds where user has active sessions
		query += ` AND (w.user_id = $` + strconv.Itoa(argCount) +
			` OR w.id IN (SELECT DISTINCT world_id FROM adventure_sessions WHERE user_id = $` +
			strconv.Itoa(argCount) + ` AND status IN ('initializing', 'active')))`

		//* countQuery needs table prefix only when includeUserName is true (has JOIN)
		if includeUserName {
			countQuery += ` AND (w.user_id = $` + strconv.Itoa(countArgCount) +
				` OR w.id IN (SELECT DISTINCT world_id FROM adventure_sessions WHERE user_id = $` +
				strconv.Itoa(countArgCount) + ` AND status IN ('initializing', 'active')))`
		} else {
			countQuery += ` AND (user_id = $` + strconv.Itoa(countArgCount) +
				` OR id IN (SELECT DISTINCT world_id FROM adventure_sessions WHERE user_id = $` +
				strconv.Itoa(countArgCount) + ` AND status IN ('initializing', 'active')))`
		}
		args = append(args, *userID)
		countArgs = append(countArgs, *userID)
	}
	if theme != nil {
		argCount++
		countArgCount++
		query += ` AND w.theme = $` + strconv.Itoa(argCount)
		countQuery += ` AND theme = $` + strconv.Itoa(countArgCount)
		args = append(args, *theme)
		countArgs = append(countArgs, *theme)
	}
	if status != nil {
		argCount++
		countArgCount++
		query += ` AND w.status = $` + strconv.Itoa(argCount)
		countQuery += ` AND status = $` + strconv.Itoa(countArgCount)
		args = append(args, *status)
		countArgs = append(countArgs, *status)
	}

	//* For global scope (userID == nil), only show published worlds
	if userID == nil {
		query += ` AND w.visibility = 'published'`
		countQuery += ` AND visibility = 'published'`
	}

	//* Dynamic sorting
	orderByClause := ` ORDER BY w.created_at DESC` // default
	if sortBy != nil {
		switch *sortBy {
		case "rating_desc":
			orderByClause = ` ORDER BY w.rating DESC NULLS LAST, w.created_at DESC`
		case "active_sessions_desc":
			orderByClause = ` ORDER BY active_sessions_count DESC, w.created_at DESC`
		case "created_at_desc":
			orderByClause = ` ORDER BY w.created_at DESC`
		default:
			orderByClause = ` ORDER BY w.created_at DESC`
		}
	}

	query += orderByClause + ` LIMIT $` + strconv.Itoa(argCount+1) + ` OFFSET $` + strconv.Itoa(argCount+2)
	args = append(args, limit, offset)

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var worlds []*World
	for rows.Next() {
		var world World
		var sessionID sql.NullInt64
		var portraitURL sql.NullString
		var rating sql.NullFloat64
		var activeSessions sql.NullInt64
		err := rows.Scan(&world.ID, &world.UserID, &world.UserName, &world.Status, &world.Theme, &world.FullStory, &sessionID, &world.Visibility, &world.CreatedAt, &world.UpdatedAt, &portraitURL, &rating, &activeSessions)
		if err != nil {
			return nil, 0, err
		}
		if sessionID.Valid {
			sessionIDInt := int(sessionID.Int64)
			world.SessionID = &sessionIDInt
		}
		if portraitURL.Valid && portraitURL.String != "" {
			world.PortraitURL = &portraitURL.String
		}
		if rating.Valid {
			ratingFloat := rating.Float64
			world.Rating = &ratingFloat
		}
		if activeSessions.Valid {
			activeSessionsInt := int(activeSessions.Int64)
			world.ActiveSessions = &activeSessionsInt
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

func (s *PostgresWorldStore) SearchWorldsByEmbedding(embedding []float32, userID *int, theme *string, status *string, includeUserName bool, currentUserID int, limit int, offset int) ([]*World, int, error) {
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
		SELECT w.id, w.user_id, u.username as user_name, w.status, w.theme, w.full_story,
		       (SELECT id FROM adventure_sessions
		        WHERE world_id = w.id AND user_id = %d AND status IN ('initializing', 'active')
		        ORDER BY created_at DESC LIMIT 1) as session_id,
		       w.visibility, w.created_at, w.updated_at, (1 - (%s <=> $1))::float8 as relevance, w.%s as embedding,
		       lp.details->>'image_portrait' as portrait_url
		FROM worlds w
		JOIN users u ON w.user_id = u.id
		LEFT JOIN lore_pieces lp ON w.id = lp.world_id AND lp.type = 'character'
		WHERE w.%s IS NOT NULL`, currentUserID, column, column, column)
		countQuery = fmt.Sprintf(`
		SELECT COUNT(*)
		FROM worlds w
		JOIN users u ON w.user_id = u.id
		WHERE w.%s IS NOT NULL`, column)
	} else {
		query = fmt.Sprintf(`
		SELECT w.id, w.user_id, NULL as user_name, w.status, w.theme, w.full_story,
		       (SELECT id FROM adventure_sessions
		        WHERE world_id = w.id AND user_id = %d AND status IN ('initializing', 'active')
		        ORDER BY created_at DESC LIMIT 1) as session_id,
		       w.visibility, w.created_at, w.updated_at, (1 - (%s <=> $1))::float8 as relevance, w.%s as embedding,
		       lp.details->>'image_portrait' as portrait_url
		FROM worlds w
		LEFT JOIN lore_pieces lp ON w.id = lp.world_id AND lp.type = 'character'
		WHERE w.%s IS NOT NULL`, currentUserID, column, column, column)
		countQuery = fmt.Sprintf(`
		SELECT COUNT(*)
		FROM worlds WHERE %s IS NOT NULL`, column)
	}

	if userID != nil {
		argCount++
		countArgCount++
		//* Include both worlds owned by user AND worlds where user has active sessions
		query += ` AND (w.user_id = $` + strconv.Itoa(argCount) +
			` OR w.id IN (SELECT DISTINCT world_id FROM adventure_sessions WHERE user_id = $` +
			strconv.Itoa(argCount) + ` AND status IN ('initializing', 'active')))`

		//* countQuery needs table prefix only when includeUserName is true (has JOIN)
		if includeUserName {
			countQuery += ` AND (w.user_id = $` + strconv.Itoa(countArgCount) +
				` OR w.id IN (SELECT DISTINCT world_id FROM adventure_sessions WHERE user_id = $` +
				strconv.Itoa(countArgCount) + ` AND status IN ('initializing', 'active')))`
		} else {
			countQuery += ` AND (user_id = $` + strconv.Itoa(countArgCount) +
				` OR id IN (SELECT DISTINCT world_id FROM adventure_sessions WHERE user_id = $` +
				strconv.Itoa(countArgCount) + ` AND status IN ('initializing', 'active')))`
		}
		args = append(args, *userID)
		countArgs = append(countArgs, *userID)
	}
	if theme != nil {
		argCount++
		countArgCount++
		query += ` AND w.theme = $` + strconv.Itoa(argCount)
		countQuery += ` AND theme = $` + strconv.Itoa(countArgCount)
		args = append(args, *theme)
		countArgs = append(countArgs, *theme)
	}
	if status != nil {
		argCount++
		countArgCount++
		query += ` AND w.status = $` + strconv.Itoa(argCount)
		countQuery += ` AND status = $` + strconv.Itoa(countArgCount)
		args = append(args, *status)
		countArgs = append(countArgs, *status)
	}

	//* For global scope (userID == nil), only show published worlds
	if userID == nil {
		query += ` AND w.visibility = 'published'`
		countQuery += ` AND visibility = 'published'`
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
		var sessionID sql.NullInt64
		var embedding pgvector.Vector
		var portraitURL sql.NullString
		err := rows.Scan(
			&world.ID,
			&world.UserID,
			&world.UserName,
			&world.Status,
			&world.Theme,
			&world.FullStory,
			&sessionID,
			&world.Visibility,
			&world.CreatedAt,
			&world.UpdatedAt,
			&world.Relevance,
			&embedding,
			&portraitURL,
		)
		if err != nil {
			return nil, 0, err
		}
		if sessionID.Valid {
			sessionIDInt := int(sessionID.Int64)
			world.SessionID = &sessionIDInt
		}
		if embedding.Slice() != nil {
			world.Embedding = embedding.Slice()
		}
		if portraitURL.Valid && portraitURL.String != "" {
			world.PortraitURL = &portraitURL.String
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

func (s *PostgresWorldStore) GetProtagonistForWorld(worldID int) (*LorePiece, error) {
	query := `
	SELECT id, world_id, type, name, description, details, created_at
	FROM lore_pieces
	WHERE world_id = $1 AND type = 'character' AND details->>'is_protagonist' = 'true'
	`
	var piece LorePiece
	var detailsJSON string
	err := s.db.QueryRow(query, worldID).Scan(&piece.ID, &piece.WorldID, &piece.Type, &piece.Name, &piece.Description, &detailsJSON, &piece.CreatedAt)
	if err != nil {
		return nil, err
	}

	if detailsJSON != "" {
		if err := json.Unmarshal([]byte(detailsJSON), &piece.Details); err != nil {
			return nil, fmt.Errorf("failed to unmarshal details: %w", err)
		}
	}

	return &piece, nil

}

func (s *PostgresWorldStore) UpdateWorldStatus(worldID int, status string) error {
	query := `
	UPDATE worlds
	SET status = $1, updated_at = NOW()
	WHERE id = $2
	`
	_, err := s.db.Exec(query, status, worldID)
	return err
}

func (s *PostgresWorldStore) UpdateWorldVisibility(worldID int, visibility string) error {
	query := `
	UPDATE worlds
	SET visibility = $1, updated_at = NOW()
	WHERE id = $2
	`
	_, err := s.db.Exec(query, visibility, worldID)
	return err
}

func (s *PostgresWorldStore) UpdateLorePieceDetails(pieceID int, details map[string]interface{}) error {
	detailsJSON, err := json.Marshal(details)
	if err != nil {
		return fmt.Errorf("failed to marshal details: %w", err)
	}

	query := `
	UPDATE lore_pieces
	SET details = $1
	WHERE id = $2
	`
	_, err = s.db.Exec(query, string(detailsJSON), pieceID)
	return err
}

func (s *PostgresWorldStore) RateWorld(userID int, worldID int, rating int) error {
	//* Start a transaction to ensure consistency
	tx, err := s.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	//* Upsert user rating
	upsertQuery := `
	INSERT INTO world_ratings (user_id, world_id, rating, created_at, updated_at)
	VALUES ($1, $2, $3, NOW(), NOW())
	ON CONFLICT (user_id, world_id)
	DO UPDATE SET rating = $3, updated_at = NOW()
	`
	_, err = tx.Exec(upsertQuery, userID, worldID, rating)
	if err != nil {
		return fmt.Errorf("failed to upsert rating: %w", err)
	}

	//* Recalculate and update world average rating
	updateWorldQuery := `
	UPDATE worlds
	SET rating = (
		SELECT AVG(rating)::DECIMAL(3,2)
		FROM world_ratings
		WHERE world_id = $1
	),
	updated_at = NOW()
	WHERE id = $1
	`
	_, err = tx.Exec(updateWorldQuery, worldID)
	if err != nil {
		return fmt.Errorf("failed to update world rating: %w", err)
	}

	return tx.Commit()
}

func (s *PostgresWorldStore) GetWorldRating(worldID int) (*float64, *int, error) {
	query := `
	SELECT
		AVG(rating)::DECIMAL(3,2) as avg_rating,
		COUNT(*)::INTEGER as rating_count
	FROM world_ratings
	WHERE world_id = $1
	`
	var avgRating sql.NullFloat64
	var ratingCount int

	err := s.db.QueryRow(query, worldID).Scan(&avgRating, &ratingCount)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil, nil
		}
		return nil, nil, fmt.Errorf("failed to get world rating: %w", err)
	}

	if !avgRating.Valid || ratingCount == 0 {
		return nil, nil, nil
	}

	avgRatingFloat := avgRating.Float64
	return &avgRatingFloat, &ratingCount, nil
}

func (s *PostgresWorldStore) GetUserRating(userID int, worldID int) (*int, error) {
	query := `
	SELECT rating
	FROM world_ratings
	WHERE user_id = $1 AND world_id = $2
	`
	var rating int
	err := s.db.QueryRow(query, userID, worldID).Scan(&rating)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get user rating: %w", err)
	}

	return &rating, nil
}
