from fastapi import FastAPI
from routes import generation, user_selected_lore, users, lore_pieces, health
from prometheus_fastapi_instrumentator import Instrumentator


app = FastAPI()

Instrumentator().instrument(app).expose(app)

app.include_router(generation.router, prefix="/api", tags=["generation"])
app.include_router(lore_pieces.router, prefix="/api", tags=["lore-pieces"])
app.include_router(
    user_selected_lore.router, prefix="/api", tags=["user-selected-lore"]
)
app.include_router(users.router, prefix="/api", tags=["users"])
app.include_router(health.router, prefix="/api", tags=["health"])
