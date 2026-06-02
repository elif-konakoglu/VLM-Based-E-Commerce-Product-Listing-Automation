from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas import ImageUploadResponse
from app.services.image_service import image_service

router = APIRouter(prefix="/api/v1/uploads", tags=["uploads"])


@router.post("/images", status_code=201, response_model=ImageUploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    image = await image_service.upload_image(file, db)
    return ImageUploadResponse(
        id=image.id,
        filename=image.filename,
        original_filename=image.original_filename,
        url=image.public_url,
        content_type=image.content_type,
        size_bytes=image.size_bytes,
        width=image.width,
        height=image.height,
        created_at=image.created_at,
    )
