import asyncio
from db.base import Base
from db.session import engine

# Import it here because postgres needs to know about the models before creating tables
from db.lore_piece_db import LorePiece


async def init_db():
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

if __name__ == "__main__":
    asyncio.run(init_db())