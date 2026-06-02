from fastapi import APIRouter, Response
from sqlalchemy import text
import httpx

from app.core.config import settings
from app.core.database import AsyncSessionLocal

router = APIRouter()


@router.get("/health")
async def health_check():
    health = {
        "status": "ok",
        "version": settings.app_version,
        "database": "disconnected",
        "redis": "disconnected",
        "ollama": "unreachable",
    }

    # Check database
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
            health["database"] = "connected"
    except Exception:
        health["status"] = "degraded"

    # Check Redis
    try:
        import redis.asyncio as aioredis
        r = aioredis.from_url(settings.redis_url)
        await r.ping()
        health["redis"] = "connected"
        await r.close()
    except Exception:
        health["status"] = "degraded"

    # Check Ollama
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{settings.ollama_base_url}/api/tags")
            if resp.status_code == 200:
                health["ollama"] = "reachable"
    except Exception:
        health["status"] = "degraded"

    status_code = 200 if health["status"] == "ok" else 503
    return Response(
        content=__import__("json").dumps(health),
        media_type="application/json",
        status_code=status_code,
    )
