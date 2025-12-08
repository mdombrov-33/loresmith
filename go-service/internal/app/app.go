package app

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/mdombrov-33/loresmith/go-service/gen/lorepb"
	"github.com/mdombrov-33/loresmith/go-service/internal/api"
	"github.com/mdombrov-33/loresmith/go-service/internal/jobs"
	"github.com/mdombrov-33/loresmith/go-service/internal/middleware"
	"github.com/mdombrov-33/loresmith/go-service/internal/store"
	"github.com/mdombrov-33/loresmith/go-service/migrations"
	"github.com/redis/go-redis/v9"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type Application struct {
	Logger           *log.Logger
	UserHandler      *api.UserHandler
	LoreHandler      *api.LoreHandler
	WorldHandler     *api.WorldHandler
	AdventureHandler *api.AdventureHandler
	PortraitHandler  *api.PortraitHandler
	JobHandler       *api.JobHandler
	LoreClient       lorepb.LoreServiceClient
	Middleware       middleware.UserMiddleware
	DB               *sql.DB
	Redis            *redis.Client
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

	//* Increase max message size to 20MB to handle base64-encoded images
	maxMsgSize := 20 * 1024 * 1024 // 20MB
	
	//* gRPC
	grpcHost := os.Getenv("GRPC_HOST")
	if grpcHost == "" {
		grpcHost = "python-service"
	}
	grpcPort := os.Getenv("GRPC_PORT")
	if grpcPort == "" {
		grpcPort = "50051"
	}

	conn, err := grpc.NewClient(
		fmt.Sprintf("%s:%s", grpcHost, grpcPort),
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithDefaultCallOptions(
			grpc.MaxCallRecvMsgSize(maxMsgSize),
			grpc.MaxCallSendMsgSize(maxMsgSize),
		),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Python gRPC: %w", err)
	}
	loreClient := lorepb.NewLoreServiceClient(conn)

	//* Redis
	redisHost := os.Getenv("REDIS_HOST")
	if redisHost == "" {
		redisHost = "redis"
	}
	redisPort := os.Getenv("REDIS_PORT")
	if redisPort == "" {
		redisPort = "6379"
	}

	redisClient := redis.NewClient(&redis.Options{
		Addr:         fmt.Sprintf("%s:%s", redisHost, redisPort),
		Password:     "",
		DB:           0,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 5 * time.Second,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := redisClient.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	//* Stores
	userStore := store.NewPostgresUserStore(pgDB)
	worldStore := store.NewPostgresWorldStore(pgDB)
	adventureStore := store.NewPostgresAdventureStore(pgDB)
	partyStore := store.NewPostgresPartyStore(pgDB)
	portraitStore := store.NewPortraitStore(redisClient)

	//* Job System
	jobStore := jobs.NewStore(redisClient)
	executor := jobs.NewGRPCExecutor(loreClient, jobStore, worldStore, portraitStore, logger)
	jobManager := jobs.NewManager(jobStore, executor)

	//* Handlers
	userHandler := api.NewUserHandler(userStore, logger)
	worldHandler := api.NewWorldHandler(loreClient, worldStore, adventureStore, portraitStore, logger)
	loreHandler := api.NewLoreHandler(loreClient, logger)
	adventureHandler := api.NewAdventureHandler(adventureStore, partyStore, worldStore, logger)
	portraitHandler := api.NewPortraitHandler(portraitStore, logger)
	jobHandler := api.NewJobHandler(jobManager)
	middlewareHandler := middleware.UserMiddleware{UserStore: userStore}

	app := &Application{
		Logger:           logger,
		LoreClient:       loreClient,
		LoreHandler:      loreHandler,
		WorldHandler:     worldHandler,
		AdventureHandler: adventureHandler,
		PortraitHandler:  portraitHandler,
		JobHandler:       jobHandler,
		UserHandler:      userHandler,
		Middleware:       middlewareHandler,
		DB:               pgDB,
		Redis:            redisClient,
	}

	return app, nil
}

func (a *Application) HealthCheck(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Status is available\n")
}
