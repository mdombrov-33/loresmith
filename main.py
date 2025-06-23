import asyncio
from orchestrators import generate_lore_variants
from fastapi import FastAPI
from routes import generation

app = FastAPI()

app.include_router(generation.router, prefix="/api", tags=["generation"])


if __name__ == "__main__":
    variants = asyncio.run(generate_lore_variants())
    from pprint import pprint

    pprint(variants)
