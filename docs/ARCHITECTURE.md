# Architecture

## Overview

The AI Textile Product Admin Dashboard is a containerized monorepo application with the following components:

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | React + TypeScript + Vite | Admin dashboard SPA |
| Backend | Python FastAPI | REST API, business logic, AI orchestration |
| Database | PostgreSQL 16 | Persistent data storage |
| Cache | Redis 7 | Optional caching, rate limiting, job state |
| VLM Runtime | Ollama-compatible API | Vision-language model inference |
| Storage | Local volume (dev) / S3 (future) | Product image files |

## System Diagram

```text
┌─────────────────────────────────────────────────────────┐
│                    Admin Browser                          │
│              (React + Vite SPA)                           │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTP/JSON/multipart
                  ▼
┌─────────────────────────────────────────────────────────┐
│                  FastAPI Backend                          │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ Routers  │→ │ Services │→ │   Repositories       │  │
│  └──────────┘  └────┬─────┘  └──────────┬───────────┘  │
│                      │                    │              │
│                      ▼                    ▼              │
│            ┌─────────────────┐  ┌────────────────────┐  │
│            │  Integrations   │  │   SQLAlchemy ORM   │  │
│            │  (Ollama Client)│  │                    │  │
│            └────────┬────────┘  └────────┬───────────┘  │
└─────────────────────┼───────────────────┼───────────────┘
                      │                    │
          ┌───────────┼────────────────────┼──────────┐
          │           ▼                    ▼          │
          │  ┌──────────────┐    ┌──────────────┐    │
          │  │ Ollama API   │    │ PostgreSQL   │    │
          │  │ /api/generate│    │              │    │
          │  └──────────────┘    └──────────────┘    │
          │                                           │
          │  ┌──────────────┐    ┌──────────────┐    │
          │  │ Redis        │    │ Local/S3     │    │
          │  │              │    │ File Storage │    │
          │  └──────────────┘    └──────────────┘    │
          └───────────────────────────────────────────┘
                       Docker Network
```

## Backend Architecture

### Layered Structure

```text
backend/
├── app/
│   ├── main.py                    # FastAPI application factory
│   ├── core/
│   │   ├── config.py              # Pydantic Settings (env vars)
│   │   ├── database.py            # SQLAlchemy engine + session factory
│   │   ├── dependencies.py        # FastAPI dependency injection
│   │   ├── errors.py              # Structured error classes
│   │   └── logging.py             # Logging configuration
│   ├── models/
│   │   ├── base.py                # SQLAlchemy declarative base
│   │   ├── product.py             # Product ORM model
│   │   ├── product_image.py       # ProductImage ORM model
│   │   ├── ai_analysis.py         # AIAnalysis ORM model
│   │   └── chat_message.py        # ChatMessage ORM model
│   ├── schemas/
│   │   ├── product.py             # Product Pydantic schemas
│   │   ├── ai.py                  # AI analysis request/response schemas
│   │   ├── chat.py                # Chat message schemas
│   │   ├── upload.py              # Upload response schemas
│   │   └── common.py              # Shared schemas (pagination, errors)
│   ├── repositories/
│   │   ├── product_repository.py  # Product DB operations
│   │   ├── image_repository.py    # Image DB operations
│   │   ├── ai_repository.py       # AI analysis DB operations
│   │   └── chat_repository.py     # Chat message DB operations
│   ├── services/
│   │   ├── product_service.py     # Product business logic
│   │   ├── image_service.py       # Image upload/management logic
│   │   ├── ai_analysis_service.py # AI analysis orchestration
│   │   └── chat_service.py        # Chat with VLM logic
│   ├── integrations/
│   │   └── ollama_client.py       # Ollama HTTP client
│   ├── routers/
│   │   ├── products.py            # /api/v1/products endpoints
│   │   ├── uploads.py             # /api/v1/uploads endpoints
│   │   ├── ai.py                  # /api/v1/ai endpoints
│   │   └── health.py              # /health endpoint
│   └── utils/
│       ├── json_repair.py         # JSON parsing and repair utilities
│       ├── confidence.py          # Confidence normalization helpers
│       └── image_utils.py         # Image processing utilities
├── alembic/
│   ├── env.py
│   └── versions/
├── tests/
│   ├── conftest.py
│   ├── test_ai_validation.py
│   ├── test_ollama_client.py
│   ├── test_products.py
│   └── test_uploads.py
├── prompts/
│   └── product_analysis_v1.txt    # Versioned prompt templates
├── alembic.ini
├── requirements.txt
├── Dockerfile
└── .env.example
```

### Layer Responsibilities

| Layer | Responsibility |
|-------|---------------|
| Routers | HTTP handling, request validation, response serialization |
| Services | Business logic, orchestration, workflow coordination |
| Repositories | Database access, query building, data persistence |
| Integrations | External service communication (Ollama) |
| Models | SQLAlchemy ORM table definitions |
| Schemas | Pydantic request/response validation models |

### Design Principles

- **Dependency Injection**: FastAPI's `Depends()` for service/repo injection
- **Async by default**: All I/O operations use async/await
- **Repository pattern**: Database logic isolated from business logic
- **Service layer**: Business rules live here, not in routers or repos
- **Integration isolation**: External APIs wrapped in dedicated clients

## Frontend Architecture

### Structure

```text
frontend/
├── src/
│   ├── main.tsx                   # Entry point
│   ├── App.tsx                    # Root component with providers
│   ├── router.tsx                 # React Router configuration
│   ├── api/
│   │   ├── client.ts             # Axios/fetch base client
│   │   ├── products.ts           # Product API functions
│   │   ├── ai.ts                 # AI analysis API functions
│   │   ├── uploads.ts            # Upload API functions
│   │   └── types.ts              # API response types
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── AdminShell.tsx
│   │   ├── product/
│   │   │   ├── ProductForm.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   └── ProductStatusBadge.tsx
│   │   ├── ai/
│   │   │   ├── AISuggestionPanel.tsx
│   │   │   ├── ConfidenceBadge.tsx
│   │   │   └── ChatPanel.tsx
│   │   ├── upload/
│   │   │   ├── ImageUploader.tsx
│   │   │   └── ImageGallery.tsx
│   │   ├── preview/
│   │   │   └── ProductPreview.tsx
│   │   └── ui/                    # shadcn/ui components
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── ProductListPage.tsx
│   │   ├── ProductCreatePage.tsx
│   │   ├── ProductEditPage.tsx
│   │   └── ProductPreviewPage.tsx
│   ├── hooks/
│   │   ├── useProducts.ts
│   │   ├── useProductAnalysis.ts
│   │   ├── useProductChat.ts
│   │   └── useImageUpload.ts
│   ├── schemas/
│   │   ├── product.schema.ts     # Zod schemas for forms
│   │   └── ai.schema.ts          # Zod schemas for AI responses
│   ├── types/
│   │   ├── product.ts
│   │   └── ai.ts
│   └── lib/
│       ├── utils.ts              # General utilities
│       └── constants.ts          # App constants
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
└── Dockerfile
```

### Frontend Design Decisions

- **TanStack Query**: Server state management, caching, optimistic updates
- **React Hook Form + Zod**: Form state with schema validation
- **React Router v6**: Client-side routing
- **shadcn/ui + Tailwind**: Consistent, accessible component system
- **Axios**: HTTP client with interceptors for error handling

## AI Integration Design

### Data Flow

```text
Frontend                          Backend                         Ollama
   │                                │                               │
   │  POST /ai/analyze              │                               │
   │  { image_id }                  │                               │
   │───────────────────────────────►│                               │
   │                                │  Load image from storage      │
   │                                │  Base64 encode                │
   │                                │  Construct prompt (backend)   │
   │                                │  POST /api/generate           │
   │                                │──────────────────────────────►│
   │                                │                               │
   │                                │  JSON response                │
   │                                │◄──────────────────────────────│
   │                                │                               │
   │                                │  Validate JSON structure      │
   │                                │  Normalize values             │
   │                                │  Store raw + normalized       │
   │                                │                               │
   │  { suggestions, confidences }  │                               │
   │◄───────────────────────────────│                               │
```

### Key AI Principles

- Prompt lives exclusively in backend code
- Frontend sends only image_id, never the prompt
- Backend validates all VLM output before returning to frontend
- Raw model output stored for auditability
- Normalized/validated output returned to frontend
- Confidence percentages extracted and displayed per field

## Configuration Management

All configuration via environment variables (12-factor app):

| Variable | Purpose | Default |
|----------|---------|---------|
| DATABASE_URL | PostgreSQL connection | required |
| REDIS_URL | Redis connection | redis://redis:6379/0 |
| OLLAMA_BASE_URL | Ollama endpoint | http://host.docker.internal:11434 |
| OLLAMA_MODEL | VLM model name | qwen2.5vl:7b |
| OLLAMA_TIMEOUT_SECONDS | Request timeout | 120 |
| OLLAMA_TEMPERATURE | Generation temperature | 0.2 |
| MEDIA_ROOT | Image storage path | /app/media |
| MAX_UPLOAD_MB | Max file size | 10 |
| CORS_ORIGINS | Allowed CORS origins | http://localhost:5173 |

## Error Handling Strategy

### Backend Error Response Format

```json
{
  "error": {
    "code": "AI_INVALID_JSON",
    "message": "The AI response could not be parsed. Please retry or fill fields manually.",
    "details": {}
  }
}
```

### Error Categories

| Code | HTTP Status | Trigger |
|------|-------------|---------|
| VALIDATION_ERROR | 422 | Invalid request data |
| NOT_FOUND | 404 | Resource not found |
| AI_UNAVAILABLE | 503 | Ollama endpoint unreachable |
| AI_TIMEOUT | 504 | Model response timeout |
| AI_INVALID_JSON | 502 | Model returned unparseable JSON |
| AI_VALIDATION_FAILED | 502 | Model JSON missing required fields |
| UPLOAD_TOO_LARGE | 413 | File exceeds size limit |
| UPLOAD_INVALID_TYPE | 415 | Unsupported file format |
| INTERNAL_ERROR | 500 | Unexpected server error |

## Security Considerations

- Validate uploaded file types server-side (magic bytes, not just extension)
- Restrict file size with configurable limit
- Never expose local file system paths in API responses
- Never expose AI prompts to the frontend
- Sanitize AI-generated text before rendering in HTML
- Treat all VLM output as untrusted user input
- Design for easy addition of authentication later (middleware pattern)
- Rate limit AI analysis endpoint (Redis-backed)

## Deployment Architecture

### Development (Docker Compose)

```yaml
services:
  frontend:    # Vite dev server, port 5173
  backend:     # FastAPI + Uvicorn, port 8000
  postgres:    # PostgreSQL 16, port 5432
  redis:       # Redis 7, port 6379
```

### Future Production Considerations

- Swap local volume for S3-compatible object storage
- Add nginx reverse proxy with SSL
- Add authentication service (JWT or session-based)
- Add horizontal scaling for backend
- Add model inference queue for high load
- Add CDN for product images
