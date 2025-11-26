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
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "Cookie"},
		ExposedHeaders:   []string{"Set-Cookie"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Use(middleware.Logger)

	//TODO: add /api prefix to routes?
	//* Authenticated routes
	r.Group(func(r chi.Router) {
		r.Use(app.Middleware.Authenticate)

		//* Lore generation routes
		r.Get("/generate/characters", app.LoreHandler.HandleGenerateCharacters)
		r.Get("/generate/settings", app.LoreHandler.HandleGenerateSettings)
		r.Post("/generate/events", app.LoreHandler.HandleGenerateEvents)
		r.Post("/generate/relics", app.LoreHandler.HandleGenerateRelics)
		r.Get("/generate/factions", app.LoreHandler.HandleGenerateFactions)
		r.Get("/generate/all", app.LoreHandler.HandleGenerateAll)
		r.Post("/generate/full-story", app.LoreHandler.HandleGenerateFullStory)

		//* World routes
		r.Get("/worlds", app.WorldHandler.HandleGetWorldsByFilters)
		r.Get("/worlds/search", app.WorldHandler.HandleSearchWorlds)
		r.Get("/worlds/{id}", app.WorldHandler.HandleGetWorldById)
		r.Post("/worlds/draft", app.WorldHandler.HandleCreateDraftWorld) //TODO: nuke /draft part? change to just /worlds?
		r.Delete("/worlds/{id}", app.WorldHandler.HandleDeleteWorldById)
		r.Patch("/worlds/{id}/visibility", app.WorldHandler.HandleUpdateWorldVisibility)
		r.Patch("/worlds/{id}/rate", app.WorldHandler.HandleRateWorld)

		//* Adventure routes
		r.Get("/worlds/{id}/adventure/check", app.AdventureHandler.HandleCheckActiveSession)
		r.Post("/worlds/{id}/adventure/start", app.AdventureHandler.HandleStartAdventure)
		r.Get("/adventure/{session_id}/state", app.AdventureHandler.HandleGetAdventureState)
		r.Get("/adventure/{session_id}/party", app.AdventureHandler.HandleGetParty)
		r.Post("/adventure/{session_id}/progress", app.AdventureHandler.HandleUpdateSessionProgress)
		r.Post("/adventure/{session_id}/party/update", app.AdventureHandler.HandleUpdatePartyStats)
		r.Delete("/adventure/{session_id}", app.AdventureHandler.HandleDeleteSession)
	})

	//* Public routes
	r.Get("/health", app.HealthCheck)
	r.Post("/register", app.UserHandler.HandleRegisterUser)
	r.Post("/login", app.UserHandler.HandleLoginUser)
	r.Post("/logout", app.UserHandler.HandleLogout)
	r.Get("/auth/google", app.UserHandler.HandleGoogleLogin)
	r.Get("/auth/google/callback", app.UserHandler.HandleGoogleCallback)
	r.Get("/temp-portraits/{uuid}", app.PortraitHandler.HandleGetTempPortrait)
	return r
}
