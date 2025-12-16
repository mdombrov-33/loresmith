package store

import (
	"database/sql"
	"os"
	"testing"

	_ "github.com/jackc/pgx/v4/stdlib"
	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupTestDB(t *testing.T) *sql.DB {
	err := godotenv.Load("../../../.env")
	if err != nil {
		t.Fatalf("Error loading .env file: %v", err)
	}

	host := os.Getenv("TEST_POSTGRES_HOST")
	port := os.Getenv("TEST_POSTGRES_PORT")
	dbname := os.Getenv("TEST_POSTGRES_DB")
	user := os.Getenv("TEST_POSTGRES_USER")
	password := os.Getenv("TEST_POSTGRES_PASSWORD")

	if host == "" || port == "" || dbname == "" || user == "" || password == "" {
		t.Fatalf("Missing test DB env vars. Check .env for TEST_POSTGRES_*")
	}

	dsn := "host=" + host + " port=" + port + " user=" + user + " password=" + password + " dbname=" + dbname + " sslmode=disable"
	db, err := sql.Open("pgx", dsn)
	require.NoError(t, err, "Failed to connect to test DB")

	err = Migrate(db, "../../migrations")
	require.NoError(t, err, "Failed to run migrations")

	_, err = db.Exec(`TRUNCATE users CASCADE`)
	require.NoError(t, err, "Failed to truncate users table")

	return db
}

func TestCreateUser(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	store := NewPostgresUserStore(db)

	user := &User{
		ClerkUserID: "user_test123",
		Username:    "testuser",
		Email:       "test@example.com",
	}

	err := store.CreateUser(user)
	assert.NoError(t, err, "CreateUser should not fail for valid user")

	assert.NotZero(t, user.ID, "User ID should be auto-generated and set")
	assert.NotZero(t, user.CreatedAt, "CreatedAt should be set by DB")
	assert.NotZero(t, user.UpdatedAt, "UpdatedAt should be set by DB")

	retrieved, err := store.GetUserByID(user.ID)
	require.NoError(t, err, "GetUserByID should succeed")
	assert.Equal(t, "testuser", retrieved.Username, "Username should match")
	assert.Equal(t, "test@example.com", retrieved.Email, "Email should match")
	assert.Equal(t, "user_test123", retrieved.ClerkUserID, "ClerkUserID should match")
}

func TestGetUserByClerkID(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	store := NewPostgresUserStore(db)

	user := &User{
		ClerkUserID: "user_clerk456",
		Username:    "clerkuser",
		Email:       "clerk@example.com",
	}

	err := store.CreateUser(user)
	require.NoError(t, err, "CreateUser should succeed")

	retrieved, err := store.GetUserByClerkID("user_clerk456")
	require.NoError(t, err, "GetUserByClerkID should succeed")
	assert.NotNil(t, retrieved, "User should be found")
	assert.Equal(t, "clerkuser", retrieved.Username, "Username should match")
	assert.Equal(t, "clerk@example.com", retrieved.Email, "Email should match")

	nonExistent, err := store.GetUserByClerkID("user_nonexistent")
	assert.NoError(t, err, "GetUserByClerkID should not error for non-existent user")
	assert.Nil(t, nonExistent, "Non-existent user should return nil")
}

func TestCreateUserDuplicateClerkID(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	store := NewPostgresUserStore(db)

	user1 := &User{
		ClerkUserID: "user_duplicate",
		Username:    "testuser1",
		Email:       "test1@example.com",
	}
	err := store.CreateUser(user1)
	require.NoError(t, err)

	user2 := &User{
		ClerkUserID: "user_duplicate",
		Username:    "testuser2",
		Email:       "test2@example.com",
	}
	err = store.CreateUser(user2)
	assert.Error(t, err, "CreateUser should fail for duplicate clerk_user_id")
}

func TestCreateUserDuplicateUsername(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	store := NewPostgresUserStore(db)

	user1 := &User{
		ClerkUserID: "user_test1",
		Username:    "sameusername",
		Email:       "test1@example.com",
	}
	err := store.CreateUser(user1)
	require.NoError(t, err)

	user2 := &User{
		ClerkUserID: "user_test2",
		Username:    "sameusername",
		Email:       "test2@example.com",
	}
	err = store.CreateUser(user2)
	assert.Error(t, err, "CreateUser should fail for duplicate username")
}

func TestGetUserByIDNonExistent(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	store := NewPostgresUserStore(db)

	user, err := store.GetUserByID(999)
	assert.NoError(t, err, "GetUserByID should not error for non-existent ID")
	assert.Nil(t, user, "Non-existent ID should return nil")
}
