import json
import logging
import re
from typing import Any, Optional

logger = logging.getLogger(__name__)

REQUIRED_FIELDS = [
    "main_category",
    "target_audience",
    "subcategory",
    "tags",
    "color",
    "texture",
    "pattern",
    "length_type",
    "fit_type",
    "style",
    "material_guess",
    "short_marketing_title",
    "marketing_description",
    "bullet_points",
]

ARRAY_FIELDS = {"tags", "color", "bullet_points"}

VALID_AUDIENCES = {"women", "men", "children", "baby", "unisex", "home", "fabric"}

VALID_FIT_TYPES = {
    "slim fit", "regular fit", "relaxed fit", "oversized", "loose fit",
    "bodycon", "tailored", "boxy", "flared", "a-line",
}

VALID_LENGTH_TYPES = {
    "cropped", "short", "knee-length", "midi", "maxi", "full-length",
    "ankle-length", "hip-length", "thigh-length", "floor-length",
}

AUDIENCE_WORDS = {"women", "men", "children", "baby", "unisex", "kids", "boys", "girls"}


def parse_ai_response(response_text: str) -> Optional[dict]:
    try:
        data = json.loads(response_text)
        if isinstance(data, dict):
            return data
    except json.JSONDecodeError:
        pass

    try:
        match = re.search(r'\{[\s\S]*\}', response_text)
        if match:
            data = json.loads(match.group())
            if isinstance(data, dict):
                return data
    except json.JSONDecodeError:
        pass

    return None


def normalize_confidence(value: Any) -> str:
    if isinstance(value, str):
        cleaned = value.strip().rstrip("%")
        try:
            num = float(cleaned)
            if num <= 1.0 and "%" not in value:
                num = num * 100
            num = max(0, min(100, num))
            return f"{int(num)}%"
        except ValueError:
            return "0%"
    elif isinstance(value, (int, float)):
        if value <= 1.0:
            value = value * 100
        value = max(0, min(100, value))
        return f"{int(value)}%"
    return "0%"


def _is_audience_word(value: str) -> bool:
    """Check if a value is an audience term mistakenly placed in wrong field."""
    return value.lower().strip() in AUDIENCE_WORDS


def normalize_field(field_name: str, field_data: Any) -> dict:
    if not isinstance(field_data, dict):
        return {"value": None, "confidence_percentage": "0%"}

    value = field_data.get("value")
    confidence = field_data.get("confidence_percentage", field_data.get("confidence", "0%"))

    # Normalize arrays
    if field_name in ARRAY_FIELDS:
        if isinstance(value, str):
            value = [v.strip() for v in value.split(",") if v.strip()]
        elif not isinstance(value, list):
            value = [] if value is None else [str(value)]
        value = [str(v).strip() for v in value if v]

    # Normalize target_audience
    if field_name == "target_audience" and isinstance(value, str):
        value_lower = value.lower().strip()
        if value_lower in VALID_AUDIENCES:
            value = value_lower
        else:
            confidence = "30%"

    # Validate fit_type - reject if it contains audience words
    if field_name == "fit_type" and isinstance(value, str):
        if _is_audience_word(value):
            value = "regular fit"
            confidence = "20%"
            logger.warning("fit_type contained audience word, defaulting to 'regular fit'")
        else:
            value_lower = value.lower().strip()
            matched = False
            for valid in VALID_FIT_TYPES:
                if valid in value_lower or value_lower in valid:
                    value = valid
                    matched = True
                    break
            if not matched:
                # Keep the value but lower confidence
                confidence = "40%"

    # Validate length_type - reject if it contains audience words
    if field_name == "length_type" and isinstance(value, str):
        if _is_audience_word(value):
            value = None
            confidence = "0%"
            logger.warning("length_type contained audience word, cleared")
        else:
            value_lower = value.lower().strip()
            matched = False
            for valid in VALID_LENGTH_TYPES:
                if valid in value_lower or value_lower in valid:
                    value = valid
                    matched = True
                    break
            if not matched:
                confidence = "40%"

    # Truncate marketing title
    if field_name == "short_marketing_title" and isinstance(value, str) and len(value) > 70:
        value = value[:67] + "..."

    # Normalize confidence
    confidence = normalize_confidence(confidence)

    return {"value": value, "confidence_percentage": confidence}


def validate_and_normalize(raw_data: dict) -> dict:
    normalized = {}
    for field in REQUIRED_FIELDS:
        field_data = raw_data.get(field)
        if field_data is None:
            normalized[field] = {"value": None, "confidence_percentage": "0%"}
        else:
            normalized[field] = normalize_field(field, field_data)

    return normalized
