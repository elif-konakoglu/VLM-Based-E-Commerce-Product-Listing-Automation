# Implementation Plan

## Overview

The project is built in 15 phases, starting with documentation and progressing through backend, frontend, and integration work. Each phase produces a working increment that can be verified.

---

## Phase 1: Documentation and Architecture Decisions

**Status:** Complete

**Deliverables:**
- docs/PRD.md
- docs/ARCHITECTURE.md
- docs/API_SPEC.md
- docs/DATABASE_SCHEMA.md
- docs/AI_STRATEGY.md
- docs/IMPLEMENTATION_PLAN.md
- docs/UX_GUIDE.md
- docs/TESTING_STRATEGY.md
- docs/AGENT_RULES.md
- README.md

---

## Phase 2: Project Scaffolding and Docker Setup

**Deliverables:**
- Monorepo folder structure
- Backend FastAPI skeleton with `main.py`
- Frontend Vite + React + TypeScript skeleton
- Dockerfile for backend (Python 3.11+)
- Dockerfile for frontend (Node 20+)
- docker-compose.yml (frontend, backend, postgres, redis)
- .env.example with all required variables
- Verify `docker compose up` starts all services

**Acceptance:**
- `docker compose up --build` starts without errors
- Backend responds on http://localhost:8000/health
- Frontend loads on http://localhost:5173

---

## Phase 3: Backend Foundation

**Deliverables:**
- Pydantic Settings configuration (core/config.py)
- SQLAlchemy 2.x async engine and session factory
- Alembic setup with async support
- Structured API error handling middleware
- CORS configuration
- Logging setup (structured JSON logs)
- Health endpoint with DB and Redis connectivity check

**Acceptance:**
- `/health` returns database and redis status
- Alembic can generate and run migrations
- Invalid requests return structured error JSON

---

## Phase 4: Database Models and Migrations

**Deliverables:**
- SQLAlchemy models for all tables:
  - product_images
  - ai_analyses
  - products
  - product_image_links
  - product_chat_messages
- Initial Alembic migration
- Database schema matches docs/DATABASE_SCHEMA.md

**Acceptance:**
- `alembic upgrade head` creates all tables
- `alembic downgrade base` removes all tables
- Models match documented schema

---

## Phase 5: Image Upload Service

**Deliverables:**
- POST /api/v1/uploads/images endpoint
- Content-type validation (JPEG, PNG, WebP)
- File size validation (configurable limit)
- Local file storage with UUID-based naming
- Image metadata extraction (width, height via Pillow)
- Media file serving endpoint for development
- ImageRepository for DB operations

**Acceptance:**
- Upload JPEG → returns metadata with dimensions
- Upload PNG → works
- Upload WebP → works
- Upload PDF → returns 415 error
- Upload 50MB file → returns 413 error
- Uploaded file accessible via returned URL

---

## Phase 6: Ollama Integration Client

**Deliverables:**
- OllamaClient class in integrations/
- Configurable base URL, model, timeout, options
- Image base64 encoding utility
- HTTP request with timeout handling
- Response envelope parsing
- Error classification (timeout, unavailable, invalid response)
- Connection health check for /health endpoint

**Acceptance:**
- Client sends properly formatted request to Ollama
- Timeout is respected and returns appropriate error
- Connection failures return structured error
- Model response JSON is extracted from envelope

---

## Phase 7: AI Analysis Service

**Deliverables:**
- Product analysis prompt (stored backend-only)
- Prompt versioning system
- POST /api/v1/ai/analyze endpoint
- AIAnalysisService orchestrating the flow
- JSON response validation
- Response normalization (handle partial/malformed output)
- Raw response storage in DB
- Normalized response storage in DB
- One automatic retry on JSON parse failure
- Graceful degradation on model failure

**Acceptance:**
- Send image_id → receive structured suggestions with confidence
- Invalid AI JSON → one retry → fail gracefully with error message
- Ollama down → 503 with helpful error message
- Timeout → 504 with helpful error message
- Raw model output stored in ai_analyses table
- Normalized response returned to frontend

---

## Phase 8: Product CRUD APIs

**Deliverables:**
- POST /api/v1/products (create)
- GET /api/v1/products (list with filters)
- GET /api/v1/products/{id} (detail)
- PATCH /api/v1/products/{id} (update)
- DELETE /api/v1/products/{id} (archive)
- POST /api/v1/products/{id}/publish
- POST /api/v1/products/{id}/draft
- ProductService with business logic
- ProductRepository for DB operations
- Pagination support

**Acceptance:**
- Create product with all fields → returns 201
- List products with status filter → returns correct subset
- Search products by title → returns matches
- Update single field → only that field changes
- Archive product → status becomes "archived"
- Publish draft → status becomes "published" with published_at
- Revert to draft → status becomes "draft"

---

## Phase 9: Product Chat Service

**Deliverables:**
- POST /api/v1/ai/chat endpoint
- GET /api/v1/ai/chat/history endpoint
- Chat prompt (backend-only)
- Context injection (current product data sent to model)
- Chat message persistence (admin + assistant roles)
- ChatService orchestrating the flow
- Error handling for model failures

**Acceptance:**
- Send question with image_id → receive text reply
- Chat history persisted and retrievable
- Context from current product data included in model prompt
- Model failure → error message without crash

---

## Phase 10: Frontend Foundation

**Deliverables:**
- Vite + React + TypeScript setup
- Tailwind CSS + shadcn/ui configuration
- React Router v6 with route definitions
- Admin shell layout (sidebar, header, content area)
- TanStack Query provider setup
- Axios API client with base URL and error interceptor
- Dashboard page (placeholder stats)
- Navigation between pages

**Acceptance:**
- App loads with sidebar navigation
- Routes work: /, /products, /products/new
- API client configured and ready
- TanStack Query DevTools accessible in development

---

## Phase 11: Product Creation UI

**Deliverables:**
- Image upload component (drag-and-drop + click)
- Image gallery with thumbnail grid
- Main image selection (click to select)
- "Analyze with AI" button with loading state
- AI suggestion panel showing all fields with confidence badges
- Editable product form (React Hook Form + Zod)
- Confidence badge component (high/medium/low)
- Low-confidence field highlighting
- Save Draft button
- Publish button
- Form validation messages

**Acceptance:**
- Upload multiple images → gallery shows thumbnails
- Select main image → highlighted
- Click Analyze → loading state → suggestions appear
- Each suggestion shows confidence badge
- Edit any field → form updates
- Save Draft → product created with status "draft"
- Validation errors shown for invalid fields

---

## Phase 12: Product Preview

**Deliverables:**
- Product preview component using current form state
- Preview as modal or separate route
- Shows: images, title, category, description, bullets, colors, etc.
- Responsive layout (desktop + mobile preview)
- Clear "ADMIN PREVIEW" indicator
- Preview updates live as form changes

**Acceptance:**
- Click Preview → shows product as end-user would see it
- Preview reflects current (unsaved) form values
- Preview is clearly labeled as admin-only
- Works on desktop and mobile viewports

---

## Phase 13: Product Management UI

**Deliverables:**
- Product list page with table/grid view
- Status filter tabs (All, Draft, Published, Archived)
- Search input
- Pagination
- Product detail view (read-only)
- Product edit page (same as create, pre-populated)
- Quick actions (edit, archive, publish)
- Empty states for no products

**Acceptance:**
- List shows all products with thumbnails
- Filter by status works
- Search by title/category works
- Click product → opens detail or edit
- Edit page loads with saved data
- Archive action soft-deletes product

---

## Phase 14: Chat UI

**Deliverables:**
- Chat panel component (collapsible sidebar or bottom panel)
- Message input with send button
- Message history display (admin vs assistant)
- Loading state while waiting for AI response
- Error state with retry
- Chat history loaded from API

**Acceptance:**
- Type message → send → AI response appears
- Previous messages shown in conversation thread
- Loading indicator during model response
- Error message if model fails
- Chat panel can be collapsed/expanded

---

## Phase 15: Testing and Polish

**Status:** Complete

**Deliverables:**
- Backend tests: AI validation, Ollama client (mocked), product CRUD, uploads
- Frontend tests: confidence badge, form validation (if time permits)
- Empty states for all pages
- Loading skeletons/spinners
- Error boundary with recovery
- Toast notification system
- Responsive design with mobile sidebar toggle
- README with complete setup instructions

**Acceptance:**
- `pytest` passes all 33 backend tests ✓
- TypeScript compiles with no errors ✓
- No unhandled error states in UI ✓
- App works on mobile viewport ✓
- README instructions produce a running system ✓
- Docker Compose starts cleanly from scratch ✓
- Health endpoint reports all services connected ✓

---

## Dependency Graph

```text
Phase 1 (Docs) ─────────────────────────────────────────────────────
    │
Phase 2 (Scaffold) ─────────────────────────────────────────────────
    │
Phase 3 (Backend Foundation) ───────────────────────────────────────
    │
Phase 4 (DB Models) ────────────────────────────────────────────────
    │
    ├── Phase 5 (Uploads) ──────────────────────────────────────────
    │       │
    │       ├── Phase 6 (Ollama Client) ────────────────────────────
    │       │       │
    │       │       ├── Phase 7 (AI Analysis) ──────────────────────
    │       │       │       │
    │       │       │       └── Phase 9 (Chat) ─────────────────────
    │       │       │
    │       │       └───────────────────────────────────────────────
    │       │
    │       └── Phase 8 (Product CRUD) ─────────────────────────────
    │
    └── Phase 10 (Frontend Foundation) ─────────────────────────────
            │
            ├── Phase 11 (Create UI) ───────────────────────────────
            │       │
            │       ├── Phase 12 (Preview) ─────────────────────────
            │       │
            │       └── Phase 14 (Chat UI) ─────────────────────────
            │
            └── Phase 13 (Product Management UI) ───────────────────
                    │
                    └── Phase 15 (Testing & Polish) ─────────────────
```

## Time Estimates (Approximate)

| Phase | Estimated Effort |
|-------|-----------------|
| 1. Documentation | 2-3 hours |
| 2. Scaffolding | 2-3 hours |
| 3. Backend Foundation | 3-4 hours |
| 4. DB Models | 2-3 hours |
| 5. Uploads | 2-3 hours |
| 6. Ollama Client | 2-3 hours |
| 7. AI Analysis | 4-5 hours |
| 8. Product CRUD | 3-4 hours |
| 9. Chat Service | 2-3 hours |
| 10. Frontend Foundation | 3-4 hours |
| 11. Create UI | 5-6 hours |
| 12. Preview | 2-3 hours |
| 13. Management UI | 4-5 hours |
| 14. Chat UI | 2-3 hours |
| 15. Testing & Polish | 4-5 hours |
| **Total** | **~42-57 hours** |
