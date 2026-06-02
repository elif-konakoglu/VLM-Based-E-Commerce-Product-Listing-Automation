# Implementation Plan

## Phase 1: Documentation

Create and maintain:

- PRD
- Architecture
- API spec
- Database schema decision
- AI strategy
- UX guide
- Testing strategy
- README

## Phase 2: Project Setup

Create monorepo structure:

```text
ai-textile-admin/
  backend/
  frontend/
  docs/
  docker-compose.yml
  .env.example
  README.md
```

Set up:

- frontend Vite React TypeScript app
- backend FastAPI app
- Dockerfiles
- docker-compose
- PostgreSQL
- Redis
- shared environment configuration

## Phase 3: Backend Foundation

Implement:

- Pydantic settings
- SQLAlchemy database setup
- Alembic migrations
- structured API errors
- health endpoint
- CORS config
- logging

## Phase 4: Database Models

Design and implement models for:

- products
- product images
- image links
- AI analyses
- field confidence values or confidence JSON
- product chat messages

The agent may choose the final schema.

Document decisions in `DATABASE_SCHEMA.md`.

## Phase 5: Upload Service

Implement:

- image upload endpoint
- content-type validation
- file size validation
- local media storage
- image metadata extraction
- media serving for development

## Phase 6: Ollama Integration

Implement:

- `OllamaClient`
- configurable base URL
- configurable model
- configurable timeout
- configurable model options
- image base64 encoding
- error handling
- model response parsing

## Phase 7: AI Analysis

Implement:

- backend-only prompt
- prompt versioning
- AI product analysis endpoint
- response schema validation
- response normalization
- raw response storage
- normalized response storage
- graceful fallback on invalid JSON

## Phase 8: Product APIs

Implement:

- create product
- update product
- list products
- get product detail
- publish product
- move product to draft
- archive product

## Phase 9: Product Chat

Implement:

- product image chat endpoint
- current product data context
- model response
- chat history persistence
- frontend chat panel

## Phase 10: Frontend Foundation

Implement:

- admin shell
- sidebar
- top header
- dashboard page
- routing
- API client
- TanStack Query setup
- global error handling

## Phase 11: Product Creation UI

Implement:

- image uploader
- image gallery
- main image selection
- analyze button
- AI suggestion panel
- editable product form
- confidence badges
- validation messages
- save draft
- publish

## Phase 12: Preview UI

Implement:

- product preview from current form state
- desktop preview
- mobile-responsive layout
- clear indicator that preview is internal

## Phase 13: Product Management UI

Implement:

- product list
- product detail
- product edit
- status filters
- search
- archive action

## Phase 14: Testing

Implement:

- backend validation tests
- AI parser tests
- mocked Ollama tests
- product API tests
- upload tests
- important frontend component tests if time allows

## Phase 15: Polish

Improve:

- empty states
- loading states
- AI error states
- retry behavior
- responsiveness
- README instructions
- seed/demo data
