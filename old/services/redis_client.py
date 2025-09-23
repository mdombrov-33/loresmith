import os  # To read environment variables
import redis.asyncio as redis  # Async Redis client for Python


def _str2bool(val: str | None) -> bool:
    if val is None:
        return False
    return val.strip().lower() in {"1", "true", "yes", "on"}


# Prefer URL-style configuration when available (works best on PaaS like Railway)
# Examples:
#   REDIS_URL=redis://default:<password>@host:port/0
#   REDIS_TLS_URL=rediss://default:<password>@host:port/0
REDIS_URL = (
    os.getenv("REDIS_URL")
    or os.getenv("REDIS_URI")
    or os.getenv("REDIS_TLS_URL")
    or os.getenv("REDISS_URL")
)

if REDIS_URL:
    # from_url will parse host, port, db, password, and TLS (via rediss://)
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
else:
    # Host/port style configuration (Docker Compose/local defaults)
    # Railway uses REDISHOST/REDISPORT; Compose often uses REDIS_HOST/REDIS_PORT
    REDIS_HOST = os.getenv("REDISHOST") or os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT = int(os.getenv("REDISPORT") or os.getenv("REDIS_PORT", 6379))
    REDIS_DB = int(os.getenv("REDIS_DB", 0))

    # Optional auth and TLS
    REDIS_PASSWORD = os.getenv("REDIS_PASSWORD") or os.getenv("REDISPASSWORD")
    REDIS_USERNAME = os.getenv("REDIS_USERNAME") or os.getenv("REDISUSER")
    REDIS_SSL = _str2bool(os.getenv("REDIS_SSL") or os.getenv("REDIS_TLS"))

    # Create a Redis client instance using the above config
    # decode_responses=True means Redis replies are decoded to strings instead of bytes
    redis_client = redis.Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        db=REDIS_DB,
        password=REDIS_PASSWORD,
        username=REDIS_USERNAME,
        ssl=REDIS_SSL,
        decode_responses=True,
    )
