from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas import (
    AIAnalyzeRequest,
    AIAnalysisResponse,
    AIRegenerateFieldRequest,
    AIRegenerateFieldResponse,
    ChatRequest,
    ChatResponse,
    ChatHistoryResponse,
    ChatMessageOut,
)
from app.services.ai_analysis_service import ai_analysis_service
from app.services.chat_service import chat_service

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])


@router.post("/analyze", response_model=AIAnalysisResponse)
async def analyze_product_image(
    body: AIAnalyzeRequest,
    db: AsyncSession = Depends(get_db),
):
    analysis = await ai_analysis_service.analyze_image(body.image_id, db)
    return AIAnalysisResponse(
        id=analysis.id,
        image_id=analysis.image_id,
        model=analysis.model,
        prompt_version=analysis.prompt_version,
        status=analysis.status,
        suggestions=analysis.normalized_response,
        latency_ms=analysis.latency_ms,
        created_at=analysis.created_at,
    )


@router.post("/regenerate-field", response_model=AIRegenerateFieldResponse)
async def regenerate_field(
    body: AIRegenerateFieldRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await ai_analysis_service.regenerate_single_field(
        image_id=body.image_id,
        field_name=body.field_name,
        db=db,
    )
    return AIRegenerateFieldResponse(
        field_name=result["field_name"],
        value=result["value"],
        confidence_percentage=result["confidence_percentage"],
    )


@router.post("/chat", response_model=ChatResponse)
async def product_chat(
    body: ChatRequest,
    db: AsyncSession = Depends(get_db),
):
    msg = await chat_service.send_message(
        image_id=body.image_id,
        message=body.message,
        db=db,
        product_id=body.product_id,
        context=body.context,
    )
    return ChatResponse(
        id=msg.id,
        reply=msg.message,
        created_at=msg.created_at,
    )


@router.get("/chat/history", response_model=ChatHistoryResponse)
async def chat_history(
    image_id: UUID = Query(...),
    product_id: UUID | None = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    messages, total = await chat_service.get_history(
        image_id=image_id,
        db=db,
        product_id=product_id,
        limit=limit,
        offset=offset,
    )
    return ChatHistoryResponse(
        items=[
            ChatMessageOut(
                id=m.id,
                role=m.role,
                message=m.message,
                created_at=m.created_at,
            )
            for m in messages
        ],
        total=total,
    )
