# AI Strategy

## Purpose

The AI system helps admins create better product data faster from clothing and textile images.

AI output is advisory only. Admin-approved values are final.

## Model

Initial target model:

```text
qwen2.5vl:7b
```

Runtime:

```text
Ollama-compatible API
```

The model name must be configurable using environment variables.

## Important Instruction for Coding Agent

You may improve:

- prompt wording
- response schema
- model temperature
- top_p
- top_k
- repeat_penalty
- retry strategy
- JSON parsing
- validation
- confidence handling
- chat prompt
- prompt versioning

Do not expose prompts to frontend.

Document the final chosen prompt and model options in this file.

## Baseline Product Analysis Prompt

Use this as the starting point, but improve it if needed.

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

## Baseline Ollama Payload

The agent may optimize options.

```json
{
  "model": "qwen2.5vl:7b",
  "prompt": "<backend predefined prompt>",
  "images": ["<base64 encoded image>"],
  "stream": false,
  "format": "json",
  "options": {
    "temperature": 0.2
  }
}
```

## Product Chat Prompt Starting Point

The agent may improve this prompt.

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
```

## Validation Requirements

The backend must validate:

- required fields
- field types
- target audience enum or equivalent controlled vocabulary
- confidence values
- title length
- arrays for tags, colors, and bullet points
- unsafe or unsupported claims where practical

## Confidence UX

Recommended buckets:

- 80–100%: high confidence
- 50–79%: medium confidence
- 0–49%: low confidence

Low-confidence fields should be visually highlighted for admin review.

## Failure Handling

If AI fails:

- show a clear admin-facing error
- allow manual product creation
- allow retry
- log model failure details server-side
- do not crash the product form
