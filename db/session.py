# Grab ENV like DB credentials
import os

from typing import AsyncGenerator

# Import the async engine + session maker tools from SQLAlchemy
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine


# Define POSTGRES connection string
# Format: "postgresql+asyncpg://<user>:<password>@<host>:<port>/<database>"
# For Docker Compose: defaults to postgres:5432
# For Railway: must be provided via DATABASE_URL environment variable
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://loresmith_user:somepassword@localhost:5432/loresmith",  # Local fallback
)

# Fix Railway DATABASE_URL: convert postgresql:// to postgresql+asyncpg://
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    print(f"BEFORE conversion: {DATABASE_URL[:50]}...")
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    print(f"AFTER conversion: {DATABASE_URL[:50]}...")

# Debug: Print what DATABASE_URL we're using (remove password for security)
print(
    f"Final DATABASE_URL: {DATABASE_URL.replace(':', ':***', 1) if DATABASE_URL else 'None'}"
)

# Create an async engine using the URL above
# echo=True will log all SQL queries to the console (for debugging)
try:
    engine = create_async_engine(
        DATABASE_URL,
        echo=True,
    )
except Exception as e:
    print(f"Warning: Database engine creation failed: {e}")
    engine = None

# Actual session creation to talk to the DB
# It's like a connection scope - one session per request or per task
if engine:
    async_session = async_sessionmaker(
        bind=engine,  # tell it which DB engine to use
        expire_on_commit=False,  # don't expire objects after commit
        class_=AsyncSession,  # tells SQLAlchemy to use the async version of sessions
    )
else:
    async_session = None


async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    if async_session is None:
        raise RuntimeError("Database not available - check DATABASE_URL")
    async with async_session() as session:
        yield session
