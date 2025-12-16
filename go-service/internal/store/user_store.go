package store

import (
	"database/sql"
	"time"
)

type User struct {
	ID          int64     `json:"id"`
	ClerkUserID string    `json:"clerk_user_id"`
	Username    string    `json:"username"`
	Email       string    `json:"email"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type UserStore interface {
	CreateUser(*User) error
	GetUserByID(id int64) (*User, error)
	GetUserByClerkID(clerkUserID string) (*User, error)
	UpdateUserByClerkID(clerkUserID, username, email string) error
	DeleteUserByClerkID(clerkUserID string) error
}

type PostgresUserStore struct {
	db *sql.DB
}

func NewPostgresUserStore(db *sql.DB) *PostgresUserStore {
	return &PostgresUserStore{db: db}
}

func (s *PostgresUserStore) CreateUser(user *User) error {
	query := `
	INSERT INTO users(clerk_user_id, username, email)
	VALUES($1, $2, $3)
	RETURNING id, created_at, updated_at
	`
	err := s.db.QueryRow(query, user.ClerkUserID, user.Username, user.Email).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return err
	}

	return nil
}

func (s *PostgresUserStore) GetUserByID(id int64) (*User, error) {
	user := &User{}

	query := `
	SELECT id, clerk_user_id, username, email, created_at, updated_at
	FROM users
	WHERE id = $1
	`

	err := s.db.QueryRow(query, id).Scan(
		&user.ID,
		&user.ClerkUserID,
		&user.Username,
		&user.Email,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}
	return user, nil
}

func (s *PostgresUserStore) GetUserByClerkID(clerkUserID string) (*User, error) {
	user := &User{}

	query := `
	SELECT id, clerk_user_id, username, email, created_at, updated_at
	FROM users
	WHERE clerk_user_id = $1
	`

	err := s.db.QueryRow(query, clerkUserID).Scan(
		&user.ID,
		&user.ClerkUserID,
		&user.Username,
		&user.Email,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}
	return user, nil
}

func (s *PostgresUserStore) UpdateUserByClerkID(clerkUserID, username, email string) error {
	query := `
	UPDATE users
	SET username = $1, email = $2, updated_at = NOW()
	WHERE clerk_user_id = $3
	`

	result, err := s.db.Exec(query, username, email, clerkUserID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}

func (s *PostgresUserStore) DeleteUserByClerkID(clerkUserID string) error {
	query := `
	DELETE FROM users
	WHERE clerk_user_id = $1
	`

	result, err := s.db.Exec(query, clerkUserID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}
