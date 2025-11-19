package main

import (
	"flag"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/mdombrov-33/loresmith/go-service/internal/app"
	"github.com/mdombrov-33/loresmith/go-service/internal/routes"
)

func main() {
	defaultPort := 8080
	if envPort := os.Getenv("GO_PORT"); envPort != "" {
		if p, err := strconv.Atoi(envPort); err == nil {
			defaultPort = p
		}
	}

	var port int
	flag.IntVar(&port, "port", defaultPort, "Go Service Server Port")
	flag.Parse()

	app, err := app.NewApplication()
	if err != nil {
		panic(err)
	}

	defer app.DB.Close()
	defer app.Redis.Close()

	r := routes.SetupRoutes(app)
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", port),
		Handler:      r,
		IdleTimeout:  10 * time.Minute,   //* Allow long-running connections
		ReadTimeout:  4 * time.Minute,    //* Allow search with Ollama model loading (3min) + buffer
		WriteTimeout: 6 * time.Minute,    //* Writing response (image generation takes 2-4 minutes)
	}

	app.Logger.Printf("Application started successfully on port %d", port)

	err = server.ListenAndServe()
	if err != nil {
		app.Logger.Fatalf("Failed to start server: %v", err)
	}
}
