import asyncio
from db.base import Base
from db.session import engine

async def init_db():
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

if __name__ == "__main__":
    asyncio.run(init_db())