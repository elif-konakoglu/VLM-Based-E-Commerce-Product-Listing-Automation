# AI Strategy

## Purpose

The AI subsystem accelerates product onboarding by analyzing clothing/textile images and generating structured metadata suggestions. All AI output is advisory — the admin makes the final decision.

## Model Configuration

### Primary Model

| Setting | Value | Configurable |
|---------|-------|-------------|
| Model | qwen2.5vl:7b | OLLAMA_MODEL env var |
| Runtime | Ollama-compatible API | OLLAMA_BASE_URL env var |
| Endpoint | POST /api/generate | Fixed |
| Stream | false | Fixed for analysis |
| Format | json | Fixed for analysis |
| Temperature | 0.2 | OLLAMA_TEMPERATURE env var |
| Top P | (not set) | OLLAMA_TOP_P env var |
| Top K | (not set) | OLLAMA_TOP_K env var |
| Repeat Penalty | (not set) | OLLAMA_REPEAT_PENALTY env var |
| Timeout | 120s | OLLAMA_TIMEOUT_SECONDS env var |

### Why These Defaults

- **Temperature 0.2**: Low temperature for consistent, deterministic product descriptions. Higher values would introduce unwanted variability in categorization.
- **No top_p/top_k override**: Let model defaults handle unless tuning reveals issues.
- **Timeout 120s**: Vision models on 7B parameters can take 30-90s for complex images. 120s allows headroom without hanging indefinitely.
- **JSON format enforced**: Ollama's `"format": "json"` flag constrains output to valid JSON structure.

## Product Analysis Prompt

### Version: v1

The prompt is stored exclusively in the backend (`backend/prompts/product_analysis_v1.txt` or inline in the service). The frontend never sees or sends this prompt.

```text
You are a fashion ecommerce product copywriter and visual product analyst.

Analyze only the provided fashion product image.

Return only valid JSON.
Do not use markdown.
Do not include explanations outside JSON.
Do not use the word "unknown".
Do not invent brand, exact material, sustainability claims, waterproofing, handmade claims, luxury/designer claims, size, or exact age unless clearly visible.
If a detail is partly visible or uncertain, provide the best realistic visual estimate and lower the confidence percentage.

Every top-level field must be an object with exactly two keys:
- value
- confidence_percentage

confidence_percentage must be a string from "0%" to "100%".

Target audience must be exactly one of:
- women
- men
- children
- baby
- unisex
- home
- fabric

Required JSON structure:

{
  "main_category": {
    "value": "detected main category",
    "confidence_percentage": "0% to 100%"
  },
  "target_audience": {
    "value": "women, men, children, baby, unisex, home, or fabric",
    "confidence_percentage": "0% to 100%"
  },
  "subcategory": {
    "value": "detected product type",
    "confidence_percentage": "0% to 100%"
  },
  "tags": {
    "value": ["relevant tag", "relevant tag", "relevant tag"],
    "confidence_percentage": "0% to 100%"
  },
  "color": {
    "value": ["visible color", "visible color"],
    "confidence_percentage": "0% to 100%"
  },
  "texture": {
    "value": "visible fabric texture",
    "confidence_percentage": "0% to 100%"
  },
  "pattern": {
    "value": "visible pattern",
    "confidence_percentage": "0% to 100%"
  },
  "length_type": {
    "value": "estimated length type",
    "confidence_percentage": "0% to 100%"
  },
  "fit_type": {
    "value": "estimated fit type",
    "confidence_percentage": "0% to 100%"
  },
  "style": {
    "value": "visual fashion style",
    "confidence_percentage": "0% to 100%"
  },
  "material_guess": {
    "value": "best visual material estimate",
    "confidence_percentage": "0% to 100%"
  },
  "short_marketing_title": {
    "value": "SEO optimized ecommerce title, max 70 characters",
    "confidence_percentage": "0% to 100%"
  },
  "marketing_description": {
    "value": "SEO optimized 2 to 3 sentence ecommerce description",
    "confidence_percentage": "0% to 100%"
  },
  "bullet_points": {
    "value": [
      "benefit-focused bullet",
      "benefit-focused bullet",
      "benefit-focused bullet",
      "benefit-focused bullet"
    ],
    "confidence_percentage": "0% to 100%"
  }
}

Rules:
- main_category should match the detected audience and product, such as Women Clothing, Men Clothing, Kids Clothing, Baby Clothing, Unisex Clothing, Home Textile, or Fabric.
- subcategory should be the detected product type.
- tags must describe the actual image and may include audience, product type, style, pattern, fit, length, color, and season when visually appropriate.
- color must include visible colors only.
- texture must describe visible fabric texture.
- pattern must describe visible pattern.
- length_type must be estimated from the image.
- fit_type must be estimated from silhouette, cut, drape, and visible styling.
- style must describe the visual fashion style.
- material_guess must be the best visual estimate and must not claim exact material unless clearly visible.
- short_marketing_title must be SEO optimized, ecommerce style, and maximum 70 characters.
- marketing_description must be SEO optimized, attractive, and 2 to 3 ecommerce sentences.
- bullet_points must be benefit focused and based only on visible features.
```

### Prompt Design Rationale

1. **Explicit JSON schema**: Reduces parsing failures by specifying exact structure
2. **Confidence requirement**: Each field must self-report confidence for the human-in-the-loop UI
3. **Negative instructions**: Prevents hallucination of brands, exact materials, claims
4. **Enum constraint on target_audience**: Ensures consistent categorization
5. **Character limit on title**: Enforces SEO-friendly length
6. **Visual-only rule**: Prevents the model from inventing non-visible attributes

## Product Chat Prompt

### Version: v1

Used when admin asks follow-up questions about a product image.

```text
You are a fashion ecommerce visual product assistant.

The admin is asking questions about a product image and its AI-generated product suggestions.

Answer based only on:
1. The provided product image
2. The current product suggestion data
3. The admin's question

Do not invent brand, exact material, origin, price, size, or claims that are not visible or provided.
When uncertain, say what is visually likely and explain the uncertainty briefly.
Keep answers practical for ecommerce product management.
Keep responses concise (2-4 sentences unless more detail is explicitly requested).
```

### Chat Payload Structure

```json
{
  "model": "qwen2.5vl:7b",
  "prompt": "<chat system prompt>\n\nCurrent product data:\n<JSON context>\n\nAdmin question: <message>",
  "images": ["<base64 encoded image>"],
  "stream": false,
  "options": {
    "temperature": 0.4
  }
}
```

**Note:** Chat uses slightly higher temperature (0.4) for more natural conversational responses.

## Ollama Request Payload

### Analysis Request

```json
{
  "model": "qwen2.5vl:7b",
  "prompt": "<product analysis prompt v1>",
  "images": ["<base64 encoded main product image>"],
  "stream": false,
  "format": "json",
  "options": {
    "temperature": 0.2
  }
}
```

### Expected Response Envelope

```json
{
  "model": "qwen2.5vl:7b",
  "created_at": "2026-06-01T12:00:00Z",
  "response": "<JSON string with suggestions>",
  "done": true,
  "total_duration": 45000000000,
  "load_duration": 1000000000,
  "prompt_eval_count": 500,
  "eval_count": 300,
  "eval_duration": 40000000000
}
```

The `response` field contains the JSON string that must be parsed and validated.

## Validation Strategy

### Step 1: JSON Parsing

1. Attempt `json.loads()` on the response string
2. If parsing fails, attempt lightweight JSON repair (fix trailing commas, unquoted keys)
3. If repair fails, mark analysis as `failed` with error code `AI_INVALID_JSON`

### Step 2: Schema Validation

Validate the parsed JSON against expected structure:

| Check | Action on Failure |
|-------|------------------|
| All 14 required top-level fields present | Fill missing with `{ "value": null, "confidence_percentage": "0%" }` |
| Each field has `value` and `confidence_percentage` | Normalize structure |
| `target_audience.value` in allowed enum | Default to most likely or flag as low confidence |
| `confidence_percentage` is valid format (e.g., "85%") | Attempt to parse/fix (e.g., "85" → "85%") |
| `tags.value` is array | Wrap single string in array |
| `color.value` is array | Wrap single string in array |
| `bullet_points.value` is array | Wrap single string in array |
| `short_marketing_title.value` <= 70 chars | Truncate with "..." |

### Step 3: Normalization

- Strip leading/trailing whitespace from all string values
- Ensure arrays contain only non-empty strings
- Clamp confidence to 0-100 range
- Standardize confidence format to "XX%"

## Confidence UX Mapping

| Range | Label | Visual Treatment |
|-------|-------|-----------------|
| 80–100% | High | Green badge, no special indicator |
| 50–79% | Medium | Yellow/amber badge |
| 0–49% | Low | Red/orange badge + warning icon + "Review carefully" text |

## Retry Strategy

| Scenario | Strategy |
|----------|----------|
| Ollama unreachable | No automatic retry; show error with "Retry" button |
| Timeout (>120s) | No automatic retry; show timeout error with "Retry" button |
| Invalid JSON | One automatic retry with same parameters |
| Valid JSON but missing fields | Accept partial response; fill gaps with null/0% confidence |
| Empty response | One automatic retry; then fail gracefully |

### Why No Aggressive Auto-Retry

- VLM inference is expensive (30-90s per call)
- Multiple retries would make the UI feel unresponsive
- Admin can click "Retry" manually if needed
- One silent retry for JSON issues catches transient formatting problems

## Prompt Versioning

- Prompt text lives in `backend/prompts/` or as constants in the service
- Each analysis record stores `prompt_version` (e.g., "v1", "v2")
- Changing the prompt means incrementing the version
- Old analyses retain their original prompt version for auditability
- The system can compare results across prompt versions for optimization

## Future Improvements

- A/B testing different prompt versions
- Confidence calibration based on historical accuracy
- Batch analysis for multiple images
- Model upgrade path (larger models for better accuracy)
- Streaming responses for chat (real-time typing effect)
- Fine-tuned model for textile-specific accuracy
