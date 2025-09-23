package app

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/mdombrov-33/loresmith/go-service/internal/api"
	"github.com/mdombrov-33/loresmith/go-service/internal/store"
	"github.com/mdombrov-33/loresmith/go-service/migrations"
)

type Application struct {
	Logger      *log.Logger
	UserHandler *api.UserHandler
	DB          *sql.DB
}

func NewApplication() (*Application, error) {
	pgDB, err := store.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	err = store.MigrateFS(pgDB, migrations.FS, ".")
	if err != nil {
		panic(err)
	}

	logger := log.New((os.Stdout), "", log.Ldate|log.Ltime)

	//* Stores
	userStore := store.NewPostgresUserStore(pgDB)

	//* Handlers
	userHandler := api.NewUserHandler(userStore, logger)

	app := &Application{
		Logger:      logger,
		UserHandler: userHandler,
		DB:          pgDB,
	}

	return app, nil
}

func (a *Application) HealthCheck(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Status is available\n")
}
