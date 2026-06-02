import uuid
import logging
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, delete
from sqlalchemy.orm import selectinload

from app.core.errors import NotFoundError
from app.models import Product, ProductImageLink, ProductImage
from app.schemas import ProductCreate, ProductUpdate

logger = logging.getLogger(__name__)


class ProductService:
    async def create_product(self, data: ProductCreate, db: AsyncSession) -> Product:
        product = Product(
            status=data.status,
            main_image_id=data.main_image_id,
            ai_analysis_id=data.ai_analysis_id,
            main_category=data.main_category,
            target_audience=data.target_audience,
            subcategory=data.subcategory,
            tags=data.tags,
            color=data.color,
            texture=data.texture,
            pattern=data.pattern,
            length_type=data.length_type,
            fit_type=data.fit_type,
            style=data.style,
            material_guess=data.material_guess,
            short_marketing_title=data.short_marketing_title,
            marketing_description=data.marketing_description,
            bullet_points=data.bullet_points,
            confidence_snapshot=data.confidence_snapshot,
        )
        db.add(product)
        await db.flush()

        for i, img_id in enumerate(data.image_ids):
            link = ProductImageLink(product_id=product.id, image_id=img_id, sort_order=i)
            db.add(link)

        await db.flush()

        result = await db.execute(
            select(Product).where(Product.id == product.id).options(selectinload(Product.main_image))
        )
        return result.scalar_one()

    async def get_product(self, product_id: uuid.UUID, db: AsyncSession) -> Product:
        result = await db.execute(
            select(Product).where(Product.id == product_id).options(selectinload(Product.main_image))
        )
        product = result.scalar_one_or_none()
        if not product:
            raise NotFoundError(f"Product {product_id} not found")
        return product

    async def list_products(
        self,
        db: AsyncSession,
        status: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[Product], int]:
        query = select(Product).where(Product.status != "archived")

        if status:
            query = select(Product).where(Product.status == status)
        if search:
            search_term = f"%{search}%"
            query = query.where(
                or_(
                    Product.short_marketing_title.ilike(search_term),
                    Product.main_category.ilike(search_term),
                    Product.subcategory.ilike(search_term),
                )
            )

        count_q = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_q)
        total = total_result.scalar() or 0

        query = query.order_by(Product.updated_at.desc()).offset(offset).limit(limit)
        query = query.options(selectinload(Product.main_image))
        result = await db.execute(query)
        products = list(result.scalars().all())

        return products, total

    async def update_product(self, product_id: uuid.UUID, data: ProductUpdate, db: AsyncSession) -> Product:
        product = await self.get_product(product_id, db)

        update_data = data.model_dump(exclude_unset=True)
        image_ids = update_data.pop("image_ids", None)

        for field, value in update_data.items():
            setattr(product, field, value)

        if image_ids is not None:
            await db.execute(delete(ProductImageLink).where(ProductImageLink.product_id == product_id))
            for i, img_id in enumerate(image_ids):
                link = ProductImageLink(product_id=product.id, image_id=img_id, sort_order=i)
                db.add(link)

        await db.flush()

        result = await db.execute(
            select(Product).where(Product.id == product_id).options(selectinload(Product.main_image))
        )
        return result.scalar_one()

    async def publish_product(self, product_id: uuid.UUID, db: AsyncSession) -> Product:
        product = await self.get_product(product_id, db)
        product.status = "published"
        product.published_at = datetime.now(timezone.utc)
        await db.flush()

        result = await db.execute(
            select(Product).where(Product.id == product_id).options(selectinload(Product.main_image))
        )
        return result.scalar_one()

    async def draft_product(self, product_id: uuid.UUID, db: AsyncSession) -> Product:
        product = await self.get_product(product_id, db)
        product.status = "draft"
        await db.flush()

        result = await db.execute(
            select(Product).where(Product.id == product_id).options(selectinload(Product.main_image))
        )
        return result.scalar_one()

    async def archive_product(self, product_id: uuid.UUID, db: AsyncSession) -> Product:
        product = await self.get_product(product_id, db)
        product.status = "archived"
        product.archived_at = datetime.now(timezone.utc)
        await db.flush()

        result = await db.execute(
            select(Product).where(Product.id == product_id).options(selectinload(Product.main_image))
        )
        return result.scalar_one()

    async def get_product_image_ids(self, product_id: uuid.UUID, db: AsyncSession) -> list[uuid.UUID]:
        result = await db.execute(
            select(ProductImageLink.image_id)
            .where(ProductImageLink.product_id == product_id)
            .order_by(ProductImageLink.sort_order)
        )
        return [row[0] for row in result.all()]


product_service = ProductService()
