import redis.asyncio as redis  # Async Redis client for Python
import os  # To read environment variables

# Read Redis host from environment, default to 'localhost' if not set
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")

# Read Redis port from environment, default to 6379 (Redis default port)
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

# Read Redis database index, default to 0 (Redis can have multiple logical DBs)
REDIS_DB = int(os.getenv("REDIS_DB", 0))

# Create a Redis client instance using the above config
# decode_responses=True means Redis replies are decoded to strings instead of bytes
redis_client = redis.Redis(
    host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=True
)
