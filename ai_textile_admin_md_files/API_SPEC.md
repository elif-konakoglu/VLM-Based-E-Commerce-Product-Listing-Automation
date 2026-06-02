# API Specification

## Base URL

```text
/api/v1
```

The agent may adjust endpoint names if documented and consistently implemented.

## Health

### GET `/health`

Returns service status.

```json
{
  "status": "ok"
}
```

## Uploads

### POST `/uploads/images`

Uploads a product image.

Request:

```text
multipart/form-data
file: image/jpeg | image/png | image/webp
```

Response:

```json
{
  "id": "uuid",
  "url": "/media/products/image.jpg",
  "filename": "image.jpg",
  "content_type": "image/jpeg",
  "size_bytes": 123456,
  "width": 1200,
  "height": 1600
}
```

## AI Analysis

### POST `/ai/analyze-product-image`

Runs image analysis through the backend-only predefined prompt.

Request:

```json
{
  "image_id": "uuid"
}
```

Response:

```json
{
  "id": "uuid",
  "image_id": "uuid",
  "model": "qwen2.5vl:7b",
  "prompt_version": "v1",
  "suggestions": {
    "main_category": {
      "value": "Women Clothing",
      "confidence_percentage": "94%"
    }
  },
  "created_at": "2026-06-01T12:00:00Z"
}
```

Notes:

- The actual suggestion object may be refined by the agent.
- The prompt must not be returned to the frontend.
- Raw AI output should not be returned unless explicitly useful for internal debugging.
- Store raw AI output server-side.

## AI Product Chat

### POST `/ai/product-chat`

Allows admin to ask questions about a product image and current product data.

Request:

```json
{
  "product_id": "uuid",
  "image_id": "uuid",
  "message": "Is this more casual or formal?",
  "current_product_data": {
    "short_marketing_title": "Floral Midi Dress",
    "subcategory": "Dress"
  }
}
```

Response:

```json
{
  "reply": "The product appears more casual because...",
  "created_at": "2026-06-01T12:00:00Z"
}
```

## Products

### GET `/products`

Query params:

- `status`
- `search`
- `limit`
- `offset`

Response:

```json
{
  "items": [],
  "total": 0
}
```

### POST `/products`

Creates product.

Request example:

```json
{
  "status": "draft",
  "main_image_id": "uuid",
  "image_ids": ["uuid"],
  "main_category": "Women Clothing",
  "target_audience": "women",
  "subcategory": "Dress",
  "tags": ["women", "dress", "floral"],
  "color": ["black", "white"],
  "texture": "smooth woven texture",
  "pattern": "floral print",
  "length_type": "midi length",
  "fit_type": "regular fit",
  "style": "casual feminine",
  "material_guess": "lightweight woven fabric",
  "short_marketing_title": "Floral Midi Dress",
  "marketing_description": "A versatile floral midi dress...",
  "bullet_points": [
    "Soft visual drape for everyday styling",
    "Floral pattern adds a feminine touch"
  ],
  "ai_analysis_id": "uuid"
}
```

### GET `/products/{product_id}`

Returns product detail.

### PATCH `/products/{product_id}`

Updates editable product fields.

### DELETE `/products/{product_id}`

Archives product or soft deletes depending on implementation.

### POST `/products/{product_id}/publish`

Marks product as published.

### POST `/products/{product_id}/draft`

Marks product as draft.

## Error Response Shape

Recommended:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": {}
  }
}
```
