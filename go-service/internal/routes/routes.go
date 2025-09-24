package routes

import (
	"github.com/go-chi/chi/v5"
	"github.com/mdombrov-33/loresmith/go-service/internal/app"
)

func SetupRoutes(app *app.Application) *chi.Mux {
	r := chi.NewRouter()

	r.Get("/health", app.HealthCheck)
	r.Get("/generate/characters", app.LoreHandler.HandleGenerateCharacters)

	r.Post("/register", app.UserHandler.HandleRegisterUser)
	r.Post("/login", app.UserHandler.HandleLoginUser)
	return r
}
