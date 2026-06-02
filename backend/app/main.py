from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.errors import AppError
from app.core.logging import setup_logging
from app.routers import health, products, uploads, ai
import app.models  # noqa: F401 - ensure models are registered


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging(settings.debug)
    os.makedirs(settings.media_root, exist_ok=True)
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
            }
        },
    )


app.include_router(health.router)
app.include_router(products.router)
app.include_router(uploads.router)
app.include_router(ai.router)

if os.path.isdir(settings.media_root):
    app.mount("/media", StaticFiles(directory=settings.media_root), name="media")
