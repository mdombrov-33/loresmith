package store

import (
	"database/sql"
	"time"
)

// * *int64 because in DB we have BIGINT which maps to int64 in Go
// * we use *int64 and *string for nullable fields, so we have to explicitly check for NULLs when scanning from DB
type PartyMember struct {
	ID                        int       `json:"id"`
	SessionID                 int       `json:"session_id"`
	LoreCharacterID           *int64    `json:"lore_character_id,omitempty"` //* NULL for companions, set for protagonist
	IsProtagonist             bool      `json:"is_protagonist"`
	Name                      string    `json:"name"`
	Description               string    `json:"description"`
	RelationshipToProtagonist *string   `json:"relationship_to_protagonist,omitempty"` //* NULL for protagonist
	RelationshipLevel         *int      `json:"relationship_level,omitempty"`            //* NULL for protagonist, -100 to +100 for companions
	MaxHP                     int       `json:"max_hp"`
	CurrentHP                 int       `json:"current_hp"`
	Stress                    int       `json:"stress"`
	Knowledge                 int       `json:"knowledge"`
	Empathy                   int       `json:"empathy"`
	Resilience                int       `json:"resilience"`
	Creativity                int       `json:"creativity"`
	Influence                 int       `json:"influence"`
	Perception                int       `json:"perception"`
	Skills                    string    `json:"skills"`
	Flaw                      string    `json:"flaw"`
	Personality               string    `json:"personality"`
	Appearance                string    `json:"appearance"`
	Position                  int       `json:"position"` //* 0 = protagonist, 1-3 = companions
	CreatedAt                 time.Time `json:"created_at"`
}

type PartyStore interface {
	CreatePartyMember(member *PartyMember) (int, error)
	GetPartyMemberByID(memberID int) (*PartyMember, error)
	GetPartyBySessionID(sessionID int) ([]*PartyMember, error)
	UpdatePartyMemberHP(memberID int, currentHP int) error
	UpdatePartyMemberStress(memberID int, stress int) error
	UpdatePartyMemberStats(memberID int, currentHP int, stress int) error
	UpdatePartyMemberRelationship(memberID int, relationshipLevel int) error
	DeletePartyMember(memberID int) error
	GetProtagonist(sessionID int) (*PartyMember, error)
}

type PostgresPartyStore struct {
	db *sql.DB
}

func NewPostgresPartyStore(db *sql.DB) *PostgresPartyStore {
	return &PostgresPartyStore{db: db}
}

func (s *PostgresPartyStore) CreatePartyMember(member *PartyMember) (int, error) {
	query := `
	INSERT INTO party_members(session_id, lore_character_id,
		is_protagonist, name, description, relationship_to_protagonist, relationship_level,
		max_hp, current_hp, stress, knowledge, empathy, resilience, creativity,
		influence, perception, skills, flaw, personality, appearance, position, created_at)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, NOW())
	RETURNING id
	`
	var memberID int

	err := s.db.QueryRow(query,
		member.SessionID,
		member.LoreCharacterID,
		member.IsProtagonist,
		member.Name,
		member.Description,
		member.RelationshipToProtagonist,
		member.RelationshipLevel,
		member.MaxHP,
		member.CurrentHP,
		member.Stress,
		member.Knowledge,
		member.Empathy,
		member.Resilience,
		member.Creativity,
		member.Influence,
		member.Perception,
		member.Skills,
		member.Flaw,
		member.Personality,
		member.Appearance,
		member.Position,
	).Scan(&memberID)

	if err != nil {
		return 0, err
	}
	return memberID, nil

}

func (s *PostgresPartyStore) GetPartyMemberByID(memberID int) (*PartyMember, error) {
	query := `
    SELECT id, session_id, lore_character_id, is_protagonist, name, description,
           relationship_to_protagonist, relationship_level, max_hp, current_hp, stress, lore_mastery,
           empathy, resilience, creativity, influence, perception, skills, flaw,
           personality, appearance, position, created_at
    FROM party_members WHERE id = $1
    `

	var member PartyMember
	var loreCharID sql.NullInt64    //* For nullable int64
	var relationship sql.NullString //* For nullable string
	var relLevel sql.NullInt64      //* For nullable int (relationship_level)

	err := s.db.QueryRow(query, memberID).Scan(
		&member.ID,
		&member.SessionID,
		&loreCharID,
		&member.IsProtagonist,
		&member.Name,
		&member.Description,
		&relationship,
		&relLevel,
		&member.MaxHP,
		&member.CurrentHP,
		&member.Stress,
		&member.Knowledge,
		&member.Empathy,
		&member.Resilience,
		&member.Creativity,
		&member.Influence,
		&member.Perception,
		&member.Skills,
		&member.Flaw,
		&member.Personality,
		&member.Appearance,
		&member.Position,
		&member.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	//* Handle nullable fields
	if loreCharID.Valid {
		member.LoreCharacterID = &loreCharID.Int64
	} else {
		member.LoreCharacterID = nil
	}
	if relationship.Valid {
		member.RelationshipToProtagonist = &relationship.String
	} else {
		member.RelationshipToProtagonist = nil
	}
	if relLevel.Valid {
		relLevelInt := int(relLevel.Int64)
		member.RelationshipLevel = &relLevelInt
	} else {
		member.RelationshipLevel = nil
	}

	return &member, nil
}

func (s *PostgresPartyStore) GetPartyBySessionID(sessionID int) ([]*PartyMember, error) {
	query := `
    SELECT id, session_id, lore_character_id, is_protagonist, name, description,
           relationship_to_protagonist, relationship_level, max_hp, current_hp, stress, lore_mastery,
           empathy, resilience, creativity, influence, perception, skills, flaw,
           personality, appearance, position, created_at
    FROM party_members WHERE session_id = $1
    ORDER BY position ASC
    `
	var partyMembers []*PartyMember
	rows, err := s.db.Query(query, sessionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var member PartyMember
		var loreCharID sql.NullInt64    //* For nullable int64
		var relationship sql.NullString //* For nullable string
		var relLevel sql.NullInt64      //* For nullable int (relationship_level)

		err := rows.Scan(
			&member.ID,
			&member.SessionID,
			&loreCharID,
			&member.IsProtagonist,
			&member.Name,
			&member.Description,
			&relationship,
			&relLevel,
			&member.MaxHP,
			&member.CurrentHP,
			&member.Stress,
			&member.Knowledge,
			&member.Empathy,
			&member.Resilience,
			&member.Creativity,
			&member.Influence,
			&member.Perception,
			&member.Skills,
			&member.Flaw,
			&member.Personality,
			&member.Appearance,
			&member.Position,
			&member.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		//* Handle nullable fields
		if loreCharID.Valid {
			member.LoreCharacterID = &loreCharID.Int64
		} else {
			member.LoreCharacterID = nil
		}
		if relationship.Valid {
			member.RelationshipToProtagonist = &relationship.String
		} else {
			member.RelationshipToProtagonist = nil
		}
		if relLevel.Valid {
			relLevelInt := int(relLevel.Int64)
			member.RelationshipLevel = &relLevelInt
		} else {
			member.RelationshipLevel = nil
		}

		partyMembers = append(partyMembers, &member)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return partyMembers, nil
}

func (s *PostgresPartyStore) UpdatePartyMemberHP(memberID int, currentHP int) error {
	query := `
	UPDATE party_members
	SET current_hp = $1
	WHERE id = $2
	`
	_, err := s.db.Exec(query, currentHP, memberID)
	return err
}

func (s *PostgresPartyStore) UpdatePartyMemberStress(memberID int, stress int) error {
	query := `
	UPDATE party_members
	SET stress = $1
	WHERE id = $2
	`
	_, err := s.db.Exec(query, stress, memberID)
	return err
}

func (s *PostgresPartyStore) UpdatePartyMemberStats(memberID int, currentHP int, stress int) error {
	query := `
	UPDATE party_members
	SET current_hp = $1, stress = $2
	WHERE id = $3
	`
	_, err := s.db.Exec(query, currentHP, stress, memberID)
	return err
}

func (s *PostgresPartyStore) UpdatePartyMemberRelationship(memberID int, relationshipLevel int) error {
	query := `
	UPDATE party_members
	SET relationship_level = $1
	WHERE id = $2
	`
	_, err := s.db.Exec(query, relationshipLevel, memberID)
	return err
}

func (s *PostgresPartyStore) DeletePartyMember(memberID int) error {
	query := `
	DELETE FROM party_members
	WHERE id = $1
	`
	_, err := s.db.Exec(query, memberID)
	return err
}

func (s *PostgresPartyStore) GetProtagonist(sessionID int) (*PartyMember, error) {
	query := `
    SELECT id, session_id, lore_character_id, is_protagonist, name, description,
           relationship_to_protagonist, relationship_level, max_hp, current_hp, stress, lore_mastery,
           empathy, resilience, creativity, influence, perception, skills, flaw,
           personality, appearance, position, created_at
    FROM party_members
    WHERE session_id = $1 AND is_protagonist = true
    `
	var protagonist PartyMember
	var loreCharID sql.NullInt64    //* For nullable int64
	var relationship sql.NullString //* For nullable string
	var relLevel sql.NullInt64      //* For nullable int (relationship_level)

	err := s.db.QueryRow(query, sessionID).Scan(
		&protagonist.ID,
		&protagonist.SessionID,
		&loreCharID,
		&protagonist.IsProtagonist,
		&protagonist.Name,
		&protagonist.Description,
		&relationship,
		&relLevel,
		&protagonist.MaxHP,
		&protagonist.CurrentHP,
		&protagonist.Stress,
		&protagonist.Knowledge,
		&protagonist.Empathy,
		&protagonist.Resilience,
		&protagonist.Creativity,
		&protagonist.Influence,
		&protagonist.Perception,
		&protagonist.Skills,
		&protagonist.Flaw,
		&protagonist.Personality,
		&protagonist.Appearance,
		&protagonist.Position,
		&protagonist.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	//* Handle nullable fields
	if loreCharID.Valid {
		protagonist.LoreCharacterID = &loreCharID.Int64
	} else {
		protagonist.LoreCharacterID = nil
	}
	if relationship.Valid {
		protagonist.RelationshipToProtagonist = &relationship.String
	} else {
		protagonist.RelationshipToProtagonist = nil
	}
	if relLevel.Valid {
		relLevelInt := int(relLevel.Int64)
		protagonist.RelationshipLevel = &relLevelInt
	} else {
		protagonist.RelationshipLevel = nil
	}

	return &protagonist, nil
}
