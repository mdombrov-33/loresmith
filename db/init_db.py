import asyncio
from db.base import Base
from db.session import engine

# Import it here because postgres needs to know about the models before creating tables
from db.lore_piece.models import LorePiece
from db.user.models import User
from db.user_selected_lore.models import UserSelectedLore


async def init_db():
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

if __name__ == "__main__":
    asyncio.run(init_db())