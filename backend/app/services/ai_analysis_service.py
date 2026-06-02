import uuid
import logging
import json

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.errors import AIInvalidResponseError, NotFoundError
from app.models import AIAnalysis, ProductImage
from app.integrations.ollama_client import ollama_client, OllamaClient
from app.services.prompts import (
    PRODUCT_ANALYSIS_PROMPT_V1,
    FIELD_REGENERATE_PROMPT,
    FIELD_RULES,
    CURRENT_PROMPT_VERSION,
)
from app.utils.ai_validation import parse_ai_response, validate_and_normalize
from app.services.image_service import image_service

logger = logging.getLogger(__name__)

MAX_RETRIES = 1


class AIAnalysisService:
    async def analyze_image(self, image_id: uuid.UUID, db: AsyncSession) -> AIAnalysis:
        image = await image_service.get_image(image_id, db)

        analysis = AIAnalysis(
            image_id=image.id,
            model=settings.ollama_model,
            provider="ollama",
            prompt_version=CURRENT_PROMPT_VERSION,
            model_options={
                "temperature": settings.ollama_temperature,
                "top_p": settings.ollama_top_p,
                "top_k": settings.ollama_top_k,
            },
            status="processing",
        )
        db.add(analysis)
        await db.flush()

        image_b64 = OllamaClient.encode_image_base64(image.storage_path)

        raw_data = None
        last_error = None

        for attempt in range(MAX_RETRIES + 1):
            try:
                result = await ollama_client.generate(
                    prompt=PRODUCT_ANALYSIS_PROMPT_V1,
                    image_base64=image_b64,
                    format_json=True,
                )

                raw_data = parse_ai_response(result["response_text"])
                if raw_data is None:
                    if attempt < MAX_RETRIES:
                        logger.warning("AI JSON parse failed, retrying (attempt %d)", attempt + 1)
                        continue
                    raise AIInvalidResponseError()

                analysis.raw_response = raw_data
                analysis.latency_ms = result["latency_ms"]

                normalized = validate_and_normalize(raw_data)
                analysis.normalized_response = normalized
                analysis.status = "completed"
                await db.flush()
                return analysis

            except AIInvalidResponseError:
                last_error = "AI_INVALID_JSON"
                if attempt >= MAX_RETRIES:
                    break
            except Exception as e:
                last_error = str(e)
                raise

        analysis.status = "failed"
        analysis.error_code = "AI_INVALID_JSON"
        analysis.error_message = "Failed to parse AI response after retries"
        analysis.raw_response = {"raw_text": result["response_text"]} if 'result' in dir() else None
        await db.flush()
        raise AIInvalidResponseError()

    async def get_analysis(self, analysis_id: uuid.UUID, db: AsyncSession) -> AIAnalysis:
        from sqlalchemy import select
        result = await db.execute(select(AIAnalysis).where(AIAnalysis.id == analysis_id))
        analysis = result.scalar_one_or_none()
        if not analysis:
            raise NotFoundError(f"Analysis {analysis_id} not found")
        return analysis

    async def regenerate_single_field(
        self,
        image_id: uuid.UUID,
        field_name: str,
        db: AsyncSession,
    ) -> dict:
        from app.core.errors import AppError

        valid_fields = list(FIELD_RULES.keys())
        if field_name not in valid_fields:
            raise AppError(
                status_code=400,
                code="INVALID_FIELD",
                message=f"Invalid field name: {field_name}. Valid fields: {', '.join(valid_fields)}",
            )

        image = await image_service.get_image(image_id, db)
        image_b64 = OllamaClient.encode_image_base64(image.storage_path)

        prompt = FIELD_REGENERATE_PROMPT.format(
            field_name=field_name,
            field_rules=FIELD_RULES[field_name],
        )

        result = await ollama_client.generate(
            prompt=prompt,
            image_base64=image_b64,
            format_json=True,
        )

        raw_data = parse_ai_response(result["response_text"])
        if raw_data is None:
            raise AIInvalidResponseError("Failed to parse regenerated field response")

        field_data = raw_data.get(field_name, {})
        if not isinstance(field_data, dict):
            field_data = {"value": field_data, "confidence_percentage": "70%"}

        value = field_data.get("value", "")
        confidence = field_data.get("confidence_percentage", "70%")

        normalized = validate_and_normalize({field_name: field_data})
        if field_name in normalized:
            norm_field = normalized[field_name]
            value = norm_field.get("value", value)
            confidence = norm_field.get("confidence_percentage", confidence)

        return {
            "field_name": field_name,
            "value": value,
            "confidence_percentage": confidence,
        }


ai_analysis_service = AIAnalysisService()
