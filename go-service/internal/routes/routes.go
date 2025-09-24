package routes

import (
	"github.com/go-chi/chi/v5"
	"github.com/mdombrov-33/loresmith/go-service/internal/app"
)

func SetupRoutes(app *app.Application) *chi.Mux {
	r := chi.NewRouter()

	r.Group(func(r chi.Router) {
		r.Use(app.Middleware.Authenticate)
		r.Get("/generate/characters", app.Middleware.RequireAuth(app.LoreHandler.HandleGenerateCharacters))
		r.Get("/generate/settings", app.Middleware.RequireAuth(app.LoreHandler.HandleGenerateSettings))
		r.Get("/generate/events", app.Middleware.RequireAuth(app.LoreHandler.HandleGenerateEvents))
		r.Get("/generate/relics", app.Middleware.RequireAuth(app.LoreHandler.HandleGenerateRelics))
		r.Get("/generate/factions", app.Middleware.RequireAuth(app.LoreHandler.HandleGenerateFactions))
	})

	r.Get("/health", app.HealthCheck)
	r.Post("/register", app.UserHandler.HandleRegisterUser)
	r.Post("/login", app.UserHandler.HandleLoginUser)
	return r
}
