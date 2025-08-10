"""Async SQLAlchemy session/engine setup.

Builds DATABASE_URL from either a single env var or individual POSTGRES_* vars.
"""

# Grab ENV like DB credentials
import os
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from utils.logger import logger


def _build_database_url() -> str | None:
    """Return a SQLAlchemy asyncpg URL.

    Priority:
    1) DATABASE_URL if present (convert driver if needed)
    2) Compose from POSTGRES_* variables
    3) Fallback to a sensible local default (localhost)
    """
    url = os.getenv("DATABASE_URL")
    if url:
        # Normalize driver if needed (e.g., postgresql:// -> postgresql+asyncpg://)
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    host = os.getenv("POSTGRES_HOST") or os.getenv("PGHOST") or "localhost"
    port = os.getenv("POSTGRES_PORT") or os.getenv("PGPORT") or "5432"
    db = os.getenv("POSTGRES_DB") or os.getenv("PGDATABASE") or "loresmith"
    user = os.getenv("POSTGRES_USER") or os.getenv("PGUSER") or "loresmith_user"
    password = (
        os.getenv("POSTGRES_PASSWORD") or os.getenv("PGPASSWORD") or "somepassword"
    )

    return f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{db}"


# Resolve DATABASE_URL without leaking secrets
DATABASE_URL = _build_database_url()

# Create an async engine using the URL above
engine = None
try:
    if DATABASE_URL:
        # Do not log the URL or credentials; just note the driver/host generically
        logger.debug("Initializing async DB engine with asyncpg driver")
        engine = create_async_engine(
            DATABASE_URL,
            echo=False,  # can be toggled via env later if needed
        )
    else:
        logger.error("No DATABASE_URL could be resolved")
except Exception as e:
    logger.error(f"Database engine creation failed: {e}", exc_info=True)
    engine = None

# Actual session creation to talk to the DB
if engine:
    async_session = async_sessionmaker(
        bind=engine,
        expire_on_commit=False,
        class_=AsyncSession,
    )
else:
    async_session = None


async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    if async_session is None:
        raise RuntimeError("Database not available - check database configuration")
    async with async_session() as session:
        yield session
