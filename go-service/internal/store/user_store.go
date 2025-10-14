package store

import (
	"database/sql"
	"errors"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID           int64     `json:"id"`
	Username     string    `json:"username"`
	Email        string    `json:"email"`
	PasswordHash password  `json:"-"`
	Provider     string    `json:"provider"`
	ProviderID   string    `json:"provider_id"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type password struct {
	plainText *string
	hash      []byte
}

type UserStore interface {
	CreateUser(*User) error
	GetUserByUsername(username string) (*User, error)
	GetUserByID(id int64) (*User, error)
	GetUserByEmailAndProvider(email, provider string) (*User, error)
}

type PostgresUserStore struct {
	db *sql.DB
}

func (p *password) Set(plaintextPassword string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(plaintextPassword), 12)
	if err != nil {
		return err
	}
	p.plainText = &plaintextPassword
	p.hash = hash
	return nil
}

func (p *password) Matches(plaintextPassword string) (bool, error) {
	err := bcrypt.CompareHashAndPassword(p.hash, []byte(plaintextPassword))
	if err != nil {
		switch {
		case errors.Is(err, bcrypt.ErrMismatchedHashAndPassword):
			return false, nil
		default:
			return false, err
		}
	}
	return true, nil
}

func NewPostgresUserStore(db *sql.DB) *PostgresUserStore {
	return &PostgresUserStore{db: db}
}

func (s *PostgresUserStore) CreateUser(user *User) error {
	query := `
	INSERT INTO users(username, email, password_hash, provider, provider_id)
	VALUES($1, $2, $3, $4, $5)
	RETURNING id, created_at, updated_at
	`
	err := s.db.QueryRow(query, user.Username, user.Email, user.PasswordHash.hash, user.Provider, user.ProviderID).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return err
	}

	return nil
}

func (s *PostgresUserStore) GetUserByUsername(username string) (*User, error) {
	user := &User{
		PasswordHash: password{},
	}

	query := `
	SELECT id, username, email, password_hash, provider, provider_id, created_at, updated_at
	FROM users
	WHERE username = $1
	`

	err := s.db.QueryRow(query, username).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.PasswordHash.hash,
		&user.Provider,
		&user.ProviderID,
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

func (s *PostgresUserStore) GetUserByID(id int64) (*User, error) {
	user := &User{
		PasswordHash: password{},
	}

	query := `
	SELECT id, username, email, password_hash, created_at, updated_at
	FROM users
	WHERE id = $1
	`

	err := s.db.QueryRow(query, id).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.PasswordHash.hash,
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

func (s *PostgresUserStore) GetUserByEmailAndProvider(email, provider string) (*User, error) {
	user := &User{
		PasswordHash: password{},
	}

	query := `
	SELECT id, username, email, password_hash, provider, provider_id, created_at, updated_at
	FROM users
	WHERE email = $1 AND provider = $2
	`

	err := s.db.QueryRow(query, email, provider).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.PasswordHash.hash,
		&user.Provider,
		&user.ProviderID,
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
