# API Specification

## Base URL

```text
/api/v1
```

All endpoints are prefixed with `/api/v1` except the health check.

## Authentication

No authentication for MVP. Design allows middleware-based auth to be added later.

## Content Types

- Request bodies: `application/json` (except uploads)
- File uploads: `multipart/form-data`
- Responses: `application/json`

---

## Health Check

### GET `/health`

Returns service and dependency status.

**Response 200:**

```json
{
  "status": "ok",
  "version": "1.0.0",
  "database": "connected",
  "redis": "connected",
  "ollama": "reachable"
}
```

---

## Uploads

### POST `/api/v1/uploads/images`

Uploads a product image file.

**Request:**

```text
Content-Type: multipart/form-data

file: binary (image/jpeg | image/png | image/webp)
```

**Constraints:**

- Max file size: configurable (default 10 MB)
- Allowed types: image/jpeg, image/png, image/webp
- Server validates magic bytes, not just Content-Type header

**Response 201:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "product_001.jpg",
  "original_filename": "IMG_2024.jpg",
  "url": "/media/products/550e8400-e29b-41d4-a716-446655440000.jpg",
  "content_type": "image/jpeg",
  "size_bytes": 245760,
  "width": 1200,
  "height": 1600,
  "created_at": "2026-06-01T12:00:00Z"
}
```

**Error 413:**

```json
{
  "error": {
    "code": "UPLOAD_TOO_LARGE",
    "message": "File size exceeds the maximum allowed size of 10 MB.",
    "details": { "max_bytes": 10485760, "received_bytes": 15728640 }
  }
}
```

**Error 415:**

```json
{
  "error": {
    "code": "UPLOAD_INVALID_TYPE",
    "message": "Unsupported file type. Allowed: JPEG, PNG, WebP.",
    "details": { "received_type": "application/pdf" }
  }
}
```

---

## AI Analysis

### POST `/api/v1/ai/analyze`

Runs VLM image analysis using the backend-only predefined prompt.

**Request:**

```json
{
  "image_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response 200:**

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "image_id": "550e8400-e29b-41d4-a716-446655440000",
  "model": "qwen2.5vl:7b",
  "prompt_version": "v1",
  "status": "completed",
  "suggestions": {
    "main_category": {
      "value": "Women Clothing",
      "confidence_percentage": "94%"
    },
    "target_audience": {
      "value": "women",
      "confidence_percentage": "96%"
    },
    "subcategory": {
      "value": "Midi Dress",
      "confidence_percentage": "88%"
    },
    "tags": {
      "value": ["women", "dress", "floral", "midi", "casual", "summer"],
      "confidence_percentage": "82%"
    },
    "color": {
      "value": ["black", "pink", "green"],
      "confidence_percentage": "90%"
    },
    "texture": {
      "value": "smooth woven texture with slight drape",
      "confidence_percentage": "72%"
    },
    "pattern": {
      "value": "floral print",
      "confidence_percentage": "95%"
    },
    "length_type": {
      "value": "midi length",
      "confidence_percentage": "91%"
    },
    "fit_type": {
      "value": "regular fit",
      "confidence_percentage": "78%"
    },
    "style": {
      "value": "casual feminine",
      "confidence_percentage": "85%"
    },
    "material_guess": {
      "value": "lightweight woven fabric, likely polyester or viscose blend",
      "confidence_percentage": "55%"
    },
    "short_marketing_title": {
      "value": "Floral Print Midi Dress with Relaxed Fit",
      "confidence_percentage": "80%"
    },
    "marketing_description": {
      "value": "Embrace effortless style with this stunning floral midi dress. The relaxed silhouette and vibrant print make it perfect for both casual outings and special occasions.",
      "confidence_percentage": "75%"
    },
    "bullet_points": {
      "value": [
        "All-over floral print for a feminine touch",
        "Comfortable midi length for versatile styling",
        "Lightweight fabric ideal for warm weather",
        "Relaxed fit flatters all body types"
      ],
      "confidence_percentage": "70%"
    }
  },
  "latency_ms": 4523,
  "created_at": "2026-06-01T12:00:05Z"
}
```

**Error 503 (Ollama unavailable):**

```json
{
  "error": {
    "code": "AI_UNAVAILABLE",
    "message": "AI service is currently unavailable. Please try again later or fill fields manually.",
    "details": { "endpoint": "ollama" }
  }
}
```

**Error 504 (Timeout):**

```json
{
  "error": {
    "code": "AI_TIMEOUT",
    "message": "AI analysis took too long. Please try again.",
    "details": { "timeout_seconds": 120 }
  }
}
```

**Error 502 (Invalid response):**

```json
{
  "error": {
    "code": "AI_INVALID_JSON",
    "message": "AI returned an invalid response. Please retry or fill fields manually.",
    "details": {}
  }
}
```

---

## AI Product Chat

### POST `/api/v1/ai/chat`

Allows admin to ask questions about a product image and current product data.

**Request:**

```json
{
  "image_id": "550e8400-e29b-41d4-a716-446655440000",
  "product_id": "770e8400-e29b-41d4-a716-446655440002",
  "message": "Is this dress more suitable for casual or formal occasions?",
  "context": {
    "short_marketing_title": "Floral Print Midi Dress",
    "subcategory": "Midi Dress",
    "style": "casual feminine"
  }
}
```

**Notes:**

- `product_id` is optional (may not exist yet during initial creation)
- `context` sends current form state so the model has awareness of current product data

**Response 200:**

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "reply": "Based on the floral print pattern, relaxed fit, and lightweight fabric visible in the image, this dress is more suitable for casual occasions. The vibrant print and midi length make it ideal for daytime events, brunches, or summer outings rather than formal settings.",
  "created_at": "2026-06-01T12:01:00Z"
}
```

### GET `/api/v1/ai/chat/history`

Retrieves chat history for a product or image.

**Query Parameters:**

- `image_id` (required): UUID
- `product_id` (optional): UUID
- `limit` (optional): integer, default 50
- `offset` (optional): integer, default 0

**Response 200:**

```json
{
  "items": [
    {
      "id": "uuid",
      "role": "admin",
      "message": "Is this more casual or formal?",
      "created_at": "2026-06-01T12:00:55Z"
    },
    {
      "id": "uuid",
      "role": "assistant",
      "message": "Based on the image...",
      "created_at": "2026-06-01T12:01:00Z"
    }
  ],
  "total": 2
}
```

---

## Products

### GET `/api/v1/products`

List products with filtering and pagination.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| status | string | - | Filter by status (draft, published, archived) |
| search | string | - | Search in title, category, tags |
| sort_by | string | created_at | Sort field |
| sort_order | string | desc | asc or desc |
| limit | integer | 20 | Items per page (max 100) |
| offset | integer | 0 | Pagination offset |

**Response 200:**

```json
{
  "items": [
    {
      "id": "uuid",
      "status": "draft",
      "short_marketing_title": "Floral Midi Dress",
      "main_category": "Women Clothing",
      "main_image_url": "/media/products/image.jpg",
      "created_at": "2026-06-01T12:00:00Z",
      "updated_at": "2026-06-01T12:05:00Z"
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

### POST `/api/v1/products`

Create a new product.

**Request:**

```json
{
  "status": "draft",
  "main_image_id": "550e8400-e29b-41d4-a716-446655440000",
  "image_ids": ["550e8400-e29b-41d4-a716-446655440000"],
  "ai_analysis_id": "660e8400-e29b-41d4-a716-446655440001",
  "main_category": "Women Clothing",
  "target_audience": "women",
  "subcategory": "Midi Dress",
  "tags": ["women", "dress", "floral", "midi", "casual"],
  "color": ["black", "pink", "green"],
  "texture": "smooth woven texture",
  "pattern": "floral print",
  "length_type": "midi length",
  "fit_type": "regular fit",
  "style": "casual feminine",
  "material_guess": "lightweight woven fabric",
  "short_marketing_title": "Floral Print Midi Dress with Relaxed Fit",
  "marketing_description": "Embrace effortless style with this stunning floral midi dress...",
  "bullet_points": [
    "All-over floral print for a feminine touch",
    "Comfortable midi length for versatile styling",
    "Lightweight fabric ideal for warm weather",
    "Relaxed fit flatters all body types"
  ]
}
```

**Response 201:**

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "status": "draft",
  "short_marketing_title": "Floral Print Midi Dress with Relaxed Fit",
  "created_at": "2026-06-01T12:10:00Z",
  "updated_at": "2026-06-01T12:10:00Z"
}
```

### GET `/api/v1/products/{product_id}`

Get full product detail.

**Response 200:**

Returns complete product object with all fields, images, and associated AI analysis metadata.

### PATCH `/api/v1/products/{product_id}`

Update product fields. Only provided fields are updated.

**Request:**

```json
{
  "short_marketing_title": "Updated Title",
  "tags": ["updated", "tags"],
  "status": "draft"
}
```

**Response 200:**

Returns updated product object.

### DELETE `/api/v1/products/{product_id}`

Archives a product (soft delete).

**Response 200:**

```json
{
  "id": "uuid",
  "status": "archived",
  "archived_at": "2026-06-01T13:00:00Z"
}
```

### POST `/api/v1/products/{product_id}/publish`

Publishes a draft product.

**Response 200:**

```json
{
  "id": "uuid",
  "status": "published",
  "published_at": "2026-06-01T13:00:00Z"
}
```

### POST `/api/v1/products/{product_id}/draft`

Moves a published product back to draft.

**Response 200:**

```json
{
  "id": "uuid",
  "status": "draft",
  "updated_at": "2026-06-01T13:00:00Z"
}
```

---

## Error Response Format

All error responses follow this structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message for admin UI display",
    "details": {}
  }
}
```

### Standard Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 422 | Request body validation failed |
| NOT_FOUND | 404 | Requested resource does not exist |
| UPLOAD_TOO_LARGE | 413 | File exceeds maximum size |
| UPLOAD_INVALID_TYPE | 415 | Unsupported file MIME type |
| AI_UNAVAILABLE | 503 | Cannot reach Ollama endpoint |
| AI_TIMEOUT | 504 | Model inference exceeded timeout |
| AI_INVALID_JSON | 502 | Model returned unparseable response |
| AI_VALIDATION_FAILED | 502 | Model response missing required fields |
| INTERNAL_ERROR | 500 | Unexpected server error |

---

## Media Serving

### GET `/media/{path}`

Serves uploaded images from local storage (development only).

In production, images would be served from a CDN or S3 directly.
