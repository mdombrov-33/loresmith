import asyncio
from services.redis_client import (
    redis_client,
)


async def test_redis_connection():
    try:
        # Ping Redis server, it should respond with 'PONG'
        pong = await redis_client.ping()
        print("Redis connection successful:", pong)
    except Exception as e:
        print("Redis connection failed:", e)


if __name__ == "__main__":
    asyncio.run(test_redis_connection())
