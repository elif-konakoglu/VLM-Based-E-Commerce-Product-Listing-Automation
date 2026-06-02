# Architecture

## Overview

The system is composed of:

- React admin frontend
- FastAPI backend
- PostgreSQL database
- Redis for optional caching, locking, rate limiting, or async job state
- Ollama-compatible VLM endpoint
- Local image storage volume for development

## High-Level Diagram

```text
Admin Browser
    |
    | HTTP / JSON / multipart
    v
React + Vite Frontend
    |
    v
FastAPI Backend
    |
    |---------------------> PostgreSQL
    |
    |---------------------> Redis
    |
    |---------------------> Local Image Storage
    |
    |---------------------> Ollama API /api/generate
                              Vision-language model
```

## Backend Structure

Recommended structure:

```text
backend/app
  core/
    config.py
    database.py
    errors.py
    logging.py
  models/
    product.py
    product_image.py
    ai_analysis.py
    chat_message.py
  schemas/
    product.py
    ai.py
    chat.py
    common.py
  repositories/
    product_repository.py
    image_repository.py
    ai_repository.py
  services/
    product_service.py
    image_service.py
    ai_analysis_service.py
    product_chat_service.py
  integrations/
    ollama_client.py
  routers/
    products.py
    uploads.py
    ai.py
    health.py
  utils/
    json_utils.py
    confidence.py
```

The agent may improve this structure if it keeps the code maintainable.

## Frontend Structure

Recommended structure:

```text
frontend/src
  app/
    App.tsx
    router.tsx
  components/
    layout/
    product/
    ai/
    preview/
    ui/
  pages/
    DashboardPage.tsx
    ProductListPage.tsx
    ProductCreatePage.tsx
    ProductEditPage.tsx
    ProductPreviewPage.tsx
  api/
    client.ts
    products.ts
    ai.ts
    uploads.ts
  hooks/
    useProducts.ts
    useProductAnalysis.ts
  schemas/
    product.ts
    ai.ts
  types/
    product.ts
    ai.ts
  lib/
    utils.ts
```

## AI Design

The AI prompt is stored only in the backend.

Frontend never sends the prompt.

Frontend sends:

- image ID
- optional product ID
- chat question when using chat

Backend handles:

- image lookup
- file loading
- base64 encoding
- prompt construction
- model option selection
- Ollama request
- JSON parsing
- validation
- normalization
- persistence

## Configuration

Use environment variables for:

- database URL
- Redis URL
- media root
- upload limits
- Ollama base URL
- Ollama model name
- model timeout
- model temperature
- model options
- CORS origins

## Error Handling

The backend should return structured API errors.

Example:

```json
{
  "error": {
    "code": "AI_INVALID_JSON",
    "message": "The AI response could not be parsed. Please retry or fill fields manually.",
    "details": {}
  }
}
```

Important error cases:

- Ollama unavailable
- Model timeout
- Invalid model JSON
- Missing required fields
- Invalid confidence format
- Unsupported image type
- Oversized file
- Empty model response

## Security Notes

- Validate uploaded file types.
- Restrict file size.
- Do not expose local file paths.
- Do not expose backend AI prompts.
- Sanitize AI text before rendering.
- Treat VLM output as untrusted.
- Keep future authentication easy to add.
