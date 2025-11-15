package main

import (
	"flag"
	"fmt"
	"net/http"
	"time"

	"github.com/mdombrov-33/loresmith/go-service/internal/app"
	"github.com/mdombrov-33/loresmith/go-service/internal/routes"
)

func main() {
	var port int
	flag.IntVar(&port, "port", 8080, "Go Service Server Port")
	flag.Parse()

	app, err := app.NewApplication()
	if err != nil {
		panic(err)
	}

	defer app.DB.Close()

	r := routes.SetupRoutes(app)
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", port),
		Handler:      r,
		IdleTimeout:  10 * time.Minute,   //* Allow long-running connections
		ReadTimeout:  30 * time.Second,   //* Reading request headers
		WriteTimeout: 6 * time.Minute,    //* Writing response (image generation takes 2-4 minutes)
	}

	app.Logger.Printf("Application started successfully on port %d", port)

	err = server.ListenAndServe()
	if err != nil {
		app.Logger.Fatalf("Failed to start server: %v", err)
	}
}
