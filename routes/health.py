from fastapi import APIRouter, Response, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from services.redis_client import redis_client
from db.session import get_async_db

from utils.logger import logger

router = APIRouter()


@router.get("/health", status_code=status.HTTP_200_OK, summary="Health check")
async def health_check():
    return {"status": "healthy"}


@router.get("/ready", status_code=status.HTTP_200_OK, summary="Readiness check")
async def readiness(db: AsyncSession = Depends(get_async_db)):
    try:
        redis_ok = False
        if redis_client:
            pong = await redis_client.ping()
            redis_ok = pong is True
            logger.info(f"Redis ping success: {pong}")
        else:
            logger.warning("Redis client not initialized")

        db_ok = False
        if db:
            result = await db.execute(text("SELECT 1"))
            val = result.scalar()
            db_ok = val == 1
            logger.info(f"Database SELECT 1 returned: {val}")
        else:
            logger.warning("DB session not available")

        if redis_ok and db_ok:
            logger.info("Readiness check passed")
            return {"status": "ready"}
        else:
            logger.warning(
                "Readiness check failed: redis_ok=%s, db_ok=%s", redis_ok, db_ok
            )
            return Response(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content="Service not ready",
            )

    except Exception as e:
        logger.exception(f"Exception during readiness check: {e}")
        return Response(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content="Service not ready"
        )
