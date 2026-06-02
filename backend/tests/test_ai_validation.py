import pytest
from app.utils.ai_validation import (
    parse_ai_response,
    normalize_confidence,
    normalize_field,
    validate_and_normalize,
)


class TestParseAIResponse:
    def test_valid_json(self):
        result = parse_ai_response('{"main_category": {"value": "Women Clothing", "confidence_percentage": "90%"}}')
        assert result is not None
        assert result["main_category"]["value"] == "Women Clothing"

    def test_invalid_json_returns_none(self):
        result = parse_ai_response("not json at all")
        assert result is None

    def test_json_with_extra_text(self):
        result = parse_ai_response('Some text before {"key": "value"} and after')
        assert result is not None
        assert result["key"] == "value"

    def test_empty_string(self):
        result = parse_ai_response("")
        assert result is None


class TestNormalizeConfidence:
    def test_normal_percentage(self):
        assert normalize_confidence("85%") == "85%"

    def test_without_percent_sign(self):
        assert normalize_confidence("85") == "85%"

    def test_float_string(self):
        assert normalize_confidence("0.85") == "85%"

    def test_integer(self):
        assert normalize_confidence(90) == "90%"

    def test_float_under_one(self):
        assert normalize_confidence(0.75) == "75%"

    def test_over_100(self):
        assert normalize_confidence("150%") == "100%"

    def test_negative(self):
        assert normalize_confidence("-10") == "0%"

    def test_invalid_string(self):
        assert normalize_confidence("high") == "0%"


class TestNormalizeField:
    def test_normal_field(self):
        result = normalize_field("texture", {"value": "smooth woven", "confidence_percentage": "80%"})
        assert result == {"value": "smooth woven", "confidence_percentage": "80%"}

    def test_array_field_from_string(self):
        result = normalize_field("tags", {"value": "casual, dress, summer", "confidence_percentage": "70%"})
        assert result["value"] == ["casual", "dress", "summer"]

    def test_array_field_already_array(self):
        result = normalize_field("color", {"value": ["red", "blue"], "confidence_percentage": "90%"})
        assert result["value"] == ["red", "blue"]

    def test_target_audience_valid(self):
        result = normalize_field("target_audience", {"value": "Women", "confidence_percentage": "95%"})
        assert result["value"] == "women"

    def test_target_audience_invalid(self):
        result = normalize_field("target_audience", {"value": "teenagers", "confidence_percentage": "80%"})
        assert result["confidence_percentage"] == "30%"

    def test_fit_type_with_audience_word(self):
        result = normalize_field("fit_type", {"value": "unisex", "confidence_percentage": "85%"})
        assert result["value"] == "regular fit"
        assert result["confidence_percentage"] == "20%"

    def test_fit_type_valid(self):
        result = normalize_field("fit_type", {"value": "slim fit", "confidence_percentage": "88%"})
        assert result["value"] == "slim fit"

    def test_length_type_with_audience_word(self):
        result = normalize_field("length_type", {"value": "children", "confidence_percentage": "70%"})
        assert result["value"] is None
        assert result["confidence_percentage"] == "0%"

    def test_title_truncation(self):
        long_title = "A" * 100
        result = normalize_field("short_marketing_title", {"value": long_title, "confidence_percentage": "75%"})
        assert len(result["value"]) == 70
        assert result["value"].endswith("...")

    def test_non_dict_field(self):
        result = normalize_field("texture", "just a string")
        assert result == {"value": None, "confidence_percentage": "0%"}


class TestValidateAndNormalize:
    def test_complete_response(self):
        raw = {
            "main_category": {"value": "Women Clothing", "confidence_percentage": "94%"},
            "target_audience": {"value": "women", "confidence_percentage": "96%"},
            "subcategory": {"value": "Dress", "confidence_percentage": "88%"},
            "tags": {"value": ["dress", "floral"], "confidence_percentage": "80%"},
            "color": {"value": ["black", "pink"], "confidence_percentage": "90%"},
            "texture": {"value": "smooth", "confidence_percentage": "70%"},
            "pattern": {"value": "floral", "confidence_percentage": "92%"},
            "length_type": {"value": "midi", "confidence_percentage": "85%"},
            "fit_type": {"value": "regular fit", "confidence_percentage": "78%"},
            "style": {"value": "casual", "confidence_percentage": "82%"},
            "material_guess": {"value": "polyester", "confidence_percentage": "55%"},
            "short_marketing_title": {"value": "Floral Midi Dress", "confidence_percentage": "80%"},
            "marketing_description": {"value": "A beautiful dress.", "confidence_percentage": "75%"},
            "bullet_points": {"value": ["Comfortable", "Stylish"], "confidence_percentage": "70%"},
        }
        result = validate_and_normalize(raw)
        assert len(result) == 14
        assert result["main_category"]["value"] == "Women Clothing"
        assert result["target_audience"]["value"] == "women"

    def test_missing_fields_filled(self):
        raw = {"main_category": {"value": "Men Clothing", "confidence_percentage": "90%"}}
        result = validate_and_normalize(raw)
        assert len(result) == 14
        assert result["texture"] == {"value": None, "confidence_percentage": "0%"}

    def test_empty_dict(self):
        result = validate_and_normalize({})
        assert len(result) == 14
        for field in result.values():
            assert field["confidence_percentage"] == "0%"
