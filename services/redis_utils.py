import asyncio
import logging
import random

from redis.exceptions import RedisError  # Redis client exception base

from services.redis_client import redis_client

logger = logging.getLogger(__name__)


async def redis_get_with_retries(key, max_retries=3, timeout=2):
    delay = 0.5
    for attempt in range(max_retries):
        try:
            # asyncio.wait_for enforces timeout on the awaitable Redis get call
            result = await asyncio.wait_for(redis_client.get(key), timeout=timeout)
            return result
        except (RedisError, asyncio.TimeoutError) as e:
            logger.warning(f"Redis GET attempt {attempt+1} failed for key '{key}': {e}")
            if attempt == max_retries - 1:
                logger.error(
                    f"Redis GET max retries reached for key '{key}', giving up."
                )
                return None  # Or raise if you want to propagate
            await asyncio.sleep(delay + random.uniform(0, 0.1))
            delay *= 2  # Exponential backoff
        except Exception as e:
            logger.error(f"Unexpected error during Redis GET for key '{key}': {e}")
            raise


async def redis_set_with_retries(key, value, ex=None, max_retries=3, timeout=2):
    delay = 0.5
    for attempt in range(max_retries):
        try:
            await asyncio.wait_for(redis_client.set(key, value, ex=ex), timeout=timeout)
            return True
        except (RedisError, asyncio.TimeoutError) as e:
            logger.warning(f"Redis SET attempt {attempt+1} failed for key '{key}': {e}")
            if attempt == max_retries - 1:
                logger.error(
                    f"Redis SET max retries reached for key '{key}', giving up."
                )
                return False
            await asyncio.sleep(delay + random.uniform(0, 0.1))
            delay *= 2
        except Exception as e:
            logger.error(f"Unexpected error during Redis SET for key '{key}': {e}")
            raise
