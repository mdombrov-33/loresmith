import asyncio
from logging.config import fileConfig
import os
from sqlalchemy.ext.asyncio import async_engine_from_config
from sqlalchemy import pool
from alembic import context

# Import the Base class and models to ensure they are registered with Alembic
# This is necessary for Alembic to be aware of the models and their metadata
# noqa: F401 is used to ignore unused import warnings
from db.base import Base
from db.lore_piece.models import LorePiece  # noqa: F401
from db.user.models import User  # noqa: F401
from db.user_selected_lore.models import UserSelectedLore  # noqa: F401

# Alembic Config object
config = context.config

# --- Inject DATABASE_URL from environment (Railway) ---
# Railway provides DATABASE_URL like "postgresql://..."; SQLAlchemy async needs
# "postgresql+asyncpg://...". Convert and set it on the Alembic config so both
# offline and online migrations use the correct URL.
db_url = os.getenv("DATABASE_URL", config.get_main_option("sqlalchemy.url"))
if db_url and db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
if db_url:
    config.set_main_option("sqlalchemy.url", db_url)

# Set up loggers from config file
fileConfig(config.config_file_name)

# Import DB URL from alembic.ini
target_metadata = Base.metadata


def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
