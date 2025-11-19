import os
import redis


def get_redis_client() -> redis.Redis:
    """Get Redis client instance."""
    return redis.Redis(
        host=os.getenv('REDIS_HOST', 'redis'),
        port=int(os.getenv('REDIS_PORT', '6379')),
        decode_responses=False,
        socket_connect_timeout=5,
        socket_timeout=5
    )
