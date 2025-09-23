import asyncio
from db.base import Base
from db.session import engine

# Import it here because postgres needs to know about the models before creating tables
# noqa: F401 is used to ignore unused import warnings
from db.lore_piece.models import LorePiece  # noqa: F401
from db.user.models import User  # noqa: F401
from db.user_selected_lore.models import UserSelectedLore  # noqa: F401


async def init_db():
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


if __name__ == "__main__":
    asyncio.run(init_db())
