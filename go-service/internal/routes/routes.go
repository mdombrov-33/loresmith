package routes

import (
	"github.com/go-chi/chi/v5"
	"github.com/mdombrov-33/loresmith/go-service/internal/app"
)

func SetupRoutes(app *app.Application) *chi.Mux {
	r := chi.NewRouter()

	r.Get("/health", app.HealthCheck)

	r.Get("/generate/characters", app.LoreHandler.HandleGenerateCharacters)
	r.Get("/generate/settings", app.LoreHandler.HandleGenerateSettings)
	r.Get("/generate/events", app.LoreHandler.HandleGenerateEvents)
	r.Get("/generate/relics", app.LoreHandler.HandleGenerateRelics)
	r.Get("/generate/factions", app.LoreHandler.HandleGenerateFactions)

	r.Post("/register", app.UserHandler.HandleRegisterUser)
	r.Post("/login", app.UserHandler.HandleLoginUser)
	return r
}
