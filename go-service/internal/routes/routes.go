package routes

import (
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/mdombrov-33/loresmith/go-service/internal/app"
)

func SetupRoutes(app *app.Application) *chi.Mux {
	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Use(middleware.Logger)

	r.Group(func(r chi.Router) {
		r.Use(app.Middleware.Authenticate)
		r.Get("/generate/characters", app.LoreHandler.HandleGenerateCharacters)
		r.Get("/generate/settings", app.LoreHandler.HandleGenerateSettings)
		r.Get("/generate/events", app.LoreHandler.HandleGenerateEvents)
		r.Get("/generate/relics", app.LoreHandler.HandleGenerateRelics)
		r.Get("/generate/factions", app.LoreHandler.HandleGenerateFactions)
		r.Get("/generate/all", app.LoreHandler.HandleGenerateAll)
		r.Get("/worlds/{id}", app.WorldHandler.HandleGetWorld)
		r.Post("/generate/full-story", app.LoreHandler.HandleGenerateFullStory)
		r.Post("/worlds/draft", app.WorldHandler.HandleCreateDraftWorld)
	})

	r.Get("/health", app.HealthCheck)
	r.Post("/register", app.UserHandler.HandleRegisterUser)
	r.Post("/login", app.UserHandler.HandleLoginUser)
	r.Post("/auth/google", app.UserHandler.HandleGoogleAuth)
	return r
}
