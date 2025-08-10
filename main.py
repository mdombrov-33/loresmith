import asyncio
from orchestrators import generate_lore_variants
from fastapi import FastAPI
from routes import generation, user_selected_lore, users, lore_pieces

app = FastAPI()

app.include_router(generation.router, prefix="/api", tags=["generation"])
app.include_router(lore_pieces.router, prefix="/api", tags=["lore-pieces"])
app.include_router(
    user_selected_lore.router, prefix="/api", tags=["user-selected-lore"]
)
app.include_router(users.router, prefix="/api", tags=["users"])


if __name__ == "__main__":
    variants = asyncio.run(generate_lore_variants())
    from pprint import pprint

    pprint(variants)
