# Grab ENV like DB credentials
import os

from typing import AsyncGenerator

# Import the async engine + session maker tools from SQLAlchemy
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine


# Define POSTGRES connection string
# Format: "postgresql+asyncpg://<user>:<password>@<host>:<port>/<database>"
# # Since we're using Docker Compose, "postgres" is the hostname of the container
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://loresmith_user:somepassword@postgres:5432/loresmith",
)

# Create an async engine using the URL above
# echo=True will log all SQL queries to the console (for debugging)
engine = create_async_engine(
    DATABASE_URL,
    echo=True,
)

# Actual session creation to talk to the DB
# It's like a connection scope - one session per request or per task
async_session = async_sessionmaker(
    bind=engine,  # tell it which DB engine to use
    expire_on_commit=False,  # don't expire objects after commit
    class_=AsyncSession,  # tells SQLAlchemy to use the async version of sessions
)


async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session
