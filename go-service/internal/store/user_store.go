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

type PasswordResetToken struct {
	ID        int64     `json:"id"`
	UserID    int64     `json:"user_id"`
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
	Used      bool      `json:"used"`
	CreatedAt time.Time `json:"created_at"`
}

type UserStore interface {
	CreateUser(*User) error
	GetUserByUsername(username string) (*User, error)
	GetUserByID(id int64) (*User, error)
	GetUserByEmailAndProvider(email, provider string) (*User, error)
	GetUserByEmail(email string) (*User, error)
	UpdatePassword(userID int64, newPasswordHash []byte) error
	CreatePasswordResetToken(userID int64, token string, expiresAt time.Time) error
	GetPasswordResetToken(token string) (*PasswordResetToken, error)
	MarkTokenAsUsed(token string) error
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

func (s *PostgresUserStore) GetUserByEmail(email string) (*User, error) {
	user := &User{
		PasswordHash: password{},
	}

	query := `
	SELECT id, username, email, password_hash, provider, provider_id, created_at, updated_at
	FROM users
	WHERE email = $1
	`

	err := s.db.QueryRow(query, email).Scan(
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

func (s *PostgresUserStore) UpdatePassword(userID int64, newPasswordHash []byte) error {
	query := `
	UPDATE users
	SET password_hash = $1, updated_at = NOW()
	WHERE id = $2
	`

	_, err := s.db.Exec(query, newPasswordHash, userID)
	return err
}

func (s *PostgresUserStore) CreatePasswordResetToken(userID int64, token string, expiresAt time.Time) error {
	query := `
	INSERT INTO password_reset_tokens(user_id, token, expires_at)
	VALUES($1, $2, $3)
	`

	_, err := s.db.Exec(query, userID, token, expiresAt)
	return err
}

func (s *PostgresUserStore) GetPasswordResetToken(token string) (*PasswordResetToken, error) {
	resetToken := &PasswordResetToken{}

	query := `
	SELECT id, user_id, token, expires_at, used, created_at
	FROM password_reset_tokens
	WHERE token = $1
	`

	err := s.db.QueryRow(query, token).Scan(
		&resetToken.ID,
		&resetToken.UserID,
		&resetToken.Token,
		&resetToken.ExpiresAt,
		&resetToken.Used,
		&resetToken.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}
	return resetToken, nil
}

func (s *PostgresUserStore) MarkTokenAsUsed(token string) error {
	query := `
	UPDATE password_reset_tokens
	SET used = true
	WHERE token = $1
	`

	_, err := s.db.Exec(query, token)
	return err
}
