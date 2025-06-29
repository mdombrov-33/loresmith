import asyncio
from orchestrators import generate_lore_variants
from fastapi import FastAPI
from routes import generation, user_selected_lore

app = FastAPI()

app.include_router(generation.router, prefix="/api", tags=["generation"])
app.include_router(user_selected_lore.router, prefix="/api", tags=["user-selected-lore"]) 


if __name__ == "__main__":
    variants = asyncio.run(generate_lore_variants())
    from pprint import pprint

    pprint(variants)
