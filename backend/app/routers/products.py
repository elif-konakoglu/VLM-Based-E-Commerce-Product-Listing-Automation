from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas import (
    ProductCreate,
    ProductUpdate,
    ProductOut,
    ProductListItem,
    ProductListResponse,
)
from app.services.product_service import product_service

router = APIRouter(prefix="/api/v1/products", tags=["products"])


@router.get("", response_model=ProductListResponse)
async def list_products(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    products, total = await product_service.list_products(
        db=db, status=status, search=search, limit=limit, offset=offset
    )
    items = []
    for p in products:
        main_image_url = None
        if p.main_image:
            main_image_url = p.main_image.public_url
        items.append(
            ProductListItem(
                id=p.id,
                status=p.status,
                short_marketing_title=p.short_marketing_title,
                main_category=p.main_category,
                main_image_url=main_image_url,
                created_at=p.created_at,
                updated_at=p.updated_at,
            )
        )
    return ProductListResponse(items=items, total=total, limit=limit, offset=offset)


@router.post("", status_code=201, response_model=ProductOut)
async def create_product(
    body: ProductCreate,
    db: AsyncSession = Depends(get_db),
):
    product = await product_service.create_product(body, db)
    image_ids = await product_service.get_product_image_ids(product.id, db)
    return _product_to_out(product, image_ids)


@router.get("/{product_id}", response_model=ProductOut)
async def get_product(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    product = await product_service.get_product(product_id, db)
    image_ids = await product_service.get_product_image_ids(product.id, db)
    return _product_to_out(product, image_ids)


@router.patch("/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: UUID,
    body: ProductUpdate,
    db: AsyncSession = Depends(get_db),
):
    product = await product_service.update_product(product_id, body, db)
    image_ids = await product_service.get_product_image_ids(product.id, db)
    return _product_to_out(product, image_ids)


@router.delete("/{product_id}", response_model=ProductOut)
async def delete_product(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    product = await product_service.archive_product(product_id, db)
    image_ids = await product_service.get_product_image_ids(product.id, db)
    return _product_to_out(product, image_ids)


@router.post("/{product_id}/publish", response_model=ProductOut)
async def publish_product(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    product = await product_service.publish_product(product_id, db)
    image_ids = await product_service.get_product_image_ids(product.id, db)
    return _product_to_out(product, image_ids)


@router.post("/{product_id}/draft", response_model=ProductOut)
async def draft_product(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    product = await product_service.draft_product(product_id, db)
    image_ids = await product_service.get_product_image_ids(product.id, db)
    return _product_to_out(product, image_ids)


def _product_to_out(product, image_ids: list[UUID]) -> ProductOut:
    main_image_url = None
    if product.main_image:
        main_image_url = product.main_image.public_url
    return ProductOut(
        id=product.id,
        status=product.status,
        main_image_id=product.main_image_id,
        main_image_url=main_image_url,
        ai_analysis_id=product.ai_analysis_id,
        main_category=product.main_category,
        target_audience=product.target_audience,
        subcategory=product.subcategory,
        tags=product.tags or [],
        color=product.color or [],
        texture=product.texture,
        pattern=product.pattern,
        length_type=product.length_type,
        fit_type=product.fit_type,
        style=product.style,
        material_guess=product.material_guess,
        short_marketing_title=product.short_marketing_title,
        marketing_description=product.marketing_description,
        bullet_points=product.bullet_points or [],
        confidence_snapshot=product.confidence_snapshot,
        image_ids=image_ids,
        created_at=product.created_at,
        updated_at=product.updated_at,
        published_at=product.published_at,
        archived_at=product.archived_at,
    )
