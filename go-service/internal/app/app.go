package app

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/mdombrov-33/loresmith/go-service/gen/lorepb"
	"github.com/mdombrov-33/loresmith/go-service/internal/api"
	"github.com/mdombrov-33/loresmith/go-service/internal/middleware"
	"github.com/mdombrov-33/loresmith/go-service/internal/store"
	"github.com/mdombrov-33/loresmith/go-service/migrations"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type Application struct {
	Logger      *log.Logger
	UserHandler *api.UserHandler
	LoreHandler *api.LoreHandler
	LoreClient  lorepb.LoreServiceClient
	Middleware  middleware.UserMiddleware
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

	conn, err := grpc.NewClient("python-service:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Python gRPC: %w", err)
	}
	loreClient := lorepb.NewLoreServiceClient(conn)

	//* Stores
	userStore := store.NewPostgresUserStore(pgDB)

	//* Handlers
	userHandler := api.NewUserHandler(userStore, logger)
	loreHandler := api.NewLoreHandler(loreClient, logger)
	middlewareHandler := middleware.UserMiddleware{UserStore: userStore}

	app := &Application{
		Logger:      logger,
		LoreClient:  loreClient,
		LoreHandler: loreHandler,
		UserHandler: userHandler,
		Middleware:  middlewareHandler,
		DB:          pgDB,
	}

	return app, nil
}

func (a *Application) HealthCheck(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Status is available\n")
}
