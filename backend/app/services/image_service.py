import uuid
import logging
from pathlib import Path

from PIL import Image
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.errors import UploadTooLargeError, UploadInvalidTypeError, NotFoundError
from app.models import ProductImage

logger = logging.getLogger(__name__)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}

# Magic byte signatures for file type detection
MAGIC_SIGNATURES = [
    (b"\xff\xd8\xff", "image/jpeg"),
    (b"\x89PNG\r\n\x1a\n", "image/png"),
]


def detect_mime_by_magic_bytes(content: bytes) -> str | None:
    """Detect file MIME type using magic byte signatures."""
    # JPEG: starts with FF D8 FF
    if content[:3] == b"\xff\xd8\xff":
        return "image/jpeg"

    # PNG: starts with 89 50 4E 47 0D 0A 1A 0A
    if content[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"

    # WebP: RIFF....WEBP
    if content[:4] == b"RIFF" and content[8:12] == b"WEBP":
        return "image/webp"

    return None


class ImageService:
    async def upload_image(self, file: UploadFile, db: AsyncSession) -> ProductImage:
        content = await file.read()

        # Validate file size
        if len(content) > settings.max_upload_bytes:
            raise UploadTooLargeError(settings.max_upload_bytes, len(content))

        # Validate by magic bytes (not trusting Content-Type header)
        detected_type = detect_mime_by_magic_bytes(content)

        if detected_type is None:
            # Fallback: try declared content type but still reject if not in allowed set
            declared = file.content_type or "application/octet-stream"
            raise UploadInvalidTypeError(declared)

        if detected_type not in ALLOWED_TYPES:
            raise UploadInvalidTypeError(detected_type)

        content_type = detected_type

        # Generate unique filename
        file_id = uuid.uuid4()
        ext = self._get_extension(content_type)
        filename = f"{file_id}{ext}"

        # Store file
        products_dir = Path(settings.media_root) / "products"
        products_dir.mkdir(parents=True, exist_ok=True)
        file_path = products_dir / filename

        with open(file_path, "wb") as f:
            f.write(content)

        # Extract dimensions
        width, height = self._get_dimensions(file_path)

        # Create DB record
        image = ProductImage(
            id=file_id,
            filename=filename,
            original_filename=file.filename or "upload",
            storage_path=str(file_path),
            public_url=f"/media/products/{filename}",
            content_type=content_type,
            size_bytes=len(content),
            width=width,
            height=height,
        )

        db.add(image)
        await db.flush()

        logger.info(
            "Image uploaded: %s (%s, %d bytes, %sx%s)",
            filename, content_type, len(content), width, height
        )
        return image

    async def get_image(self, image_id: uuid.UUID, db: AsyncSession) -> ProductImage:
        result = await db.execute(select(ProductImage).where(ProductImage.id == image_id))
        image = result.scalar_one_or_none()
        if not image:
            raise NotFoundError(f"Image {image_id} not found")
        return image

    def _get_extension(self, content_type: str) -> str:
        return {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp",
        }.get(content_type, ".bin")

    def _get_dimensions(self, file_path: Path) -> tuple[int | None, int | None]:
        try:
            with Image.open(file_path) as img:
                return img.width, img.height
        except Exception as e:
            logger.warning("Could not extract dimensions from %s: %s", file_path, e)
            return None, None


image_service = ImageService()
