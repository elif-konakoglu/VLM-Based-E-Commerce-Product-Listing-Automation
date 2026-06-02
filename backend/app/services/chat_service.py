import uuid
import json
import logging

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.errors import NotFoundError
from app.models import ProductChatMessage, ProductImage
from app.integrations.ollama_client import ollama_client, OllamaClient
from app.services.prompts import PRODUCT_CHAT_PROMPT_V1
from app.services.image_service import image_service

logger = logging.getLogger(__name__)


class ChatService:
    async def send_message(
        self,
        image_id: uuid.UUID,
        message: str,
        db: AsyncSession,
        product_id: uuid.UUID | None = None,
        context: dict | None = None,
    ) -> ProductChatMessage:
        image = await image_service.get_image(image_id, db)

        # Save admin message
        admin_msg = ProductChatMessage(
            product_id=product_id,
            image_id=image_id,
            role="admin",
            message=message,
        )
        db.add(admin_msg)
        await db.flush()

        # Build prompt with context
        prompt_parts = [PRODUCT_CHAT_PROMPT_V1]
        if context:
            prompt_parts.append(f"\n\nCurrent product data:\n{json.dumps(context, indent=2)}")
        prompt_parts.append(f"\n\nAdmin question: {message}")
        full_prompt = "".join(prompt_parts)

        image_b64 = OllamaClient.encode_image_base64(image.storage_path)

        result = await ollama_client.generate(
            prompt=full_prompt,
            image_base64=image_b64,
            format_json=False,
        )

        reply_text = result["response_text"].strip()

        assistant_msg = ProductChatMessage(
            product_id=product_id,
            image_id=image_id,
            role="assistant",
            message=reply_text,
            model=settings.ollama_model,
        )
        db.add(assistant_msg)
        await db.flush()

        return assistant_msg

    async def get_history(
        self,
        image_id: uuid.UUID,
        db: AsyncSession,
        product_id: uuid.UUID | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[list[ProductChatMessage], int]:
        query = select(ProductChatMessage).where(ProductChatMessage.image_id == image_id)
        if product_id:
            query = query.where(ProductChatMessage.product_id == product_id)

        count_query = select(ProductChatMessage.id).where(ProductChatMessage.image_id == image_id)
        if product_id:
            count_query = count_query.where(ProductChatMessage.product_id == product_id)

        from sqlalchemy import func
        total_result = await db.execute(select(func.count()).select_from(count_query.subquery()))
        total = total_result.scalar() or 0

        query = query.order_by(ProductChatMessage.created_at.asc()).offset(offset).limit(limit)
        result = await db.execute(query)
        messages = list(result.scalars().all())

        return messages, total


chat_service = ChatService()
