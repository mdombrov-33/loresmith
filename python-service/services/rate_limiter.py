from services.redis_client import redis_client


async def is_rate_limited(ip: str, limit: int = 5, window: int = 60) -> bool:
    """
    Checks if the given IP has exceeded the allowed requests limit within the window.

    Args:
        ip (str): Client IP address.
        limit (int): Max allowed requests per window.
        window (int): Time window in seconds.

    Returns:
        bool: True if rate limited, False otherwise.
    """
    key = f"rate_limit:{ip}"

    # Use Redis INCR command which increments value or sets to 1 if not exist
    current = await redis_client.incr(key)

    if current == 1:
        # First request, set expiration for window duration
        await redis_client.expire(key, window)

    if current > limit:
        return True

    return False
