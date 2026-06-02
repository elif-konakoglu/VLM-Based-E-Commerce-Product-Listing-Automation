# AI Textile Product Admin Dashboard

An admin-only e-commerce product management dashboard for textile and clothing products, powered by AI-assisted product onboarding.

## What It Does

Upload a clothing/textile product image, and an AI vision-language model analyzes it to suggest:
- Product categorization and target audience
- Colors, texture, pattern, fit, and style
- SEO-optimized marketing title and description
- Benefit-focused bullet points

All suggestions include confidence percentages. The admin reviews, edits, previews, and approves everything before saving.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| UI Components | Tailwind CSS + shadcn/ui |
| State Management | TanStack Query |
| Forms | React Hook Form + Zod |
| Backend | Python FastAPI |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| ORM | SQLAlchemy 2.x + Alembic |
| Validation | Pydantic v2 |
| AI Runtime | Ollama (qwen2.5vl:7b) |
| Containerization | Docker + Docker Compose |

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Ollama installed and running with the model pulled:

```bash
ollama pull qwen2.5vl:7b
```

### Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd gradproject
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Start all services:

```bash
docker compose up --build
```

4. Run database migrations (first time only):

```bash
docker compose exec backend alembic upgrade head
```

5. Access the application:

| Service | URL |
|---------|-----|
| Frontend (Admin Dashboard) | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Documentation (Swagger) | http://localhost:8000/docs |
| Health Check | http://localhost:8000/health |

## Environment Variables

Create a `.env` file from `.env.example`:

```env
# Database
POSTGRES_DB=ai_textile_admin
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/ai_textile_admin

# Redis
REDIS_URL=redis://redis:6379/0

# Ollama (AI Model)
OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_MODEL=qwen2.5vl:7b
OLLAMA_TIMEOUT_SECONDS=600
OLLAMA_TEMPERATURE=0.2

# Backend
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
CORS_ORIGINS=http://localhost:5173

# Storage
MEDIA_ROOT=/app/media
MAX_UPLOAD_MB=10

# Frontend
VITE_API_BASE_URL=http://localhost:8000
```

## Project Structure

```text
ai-textile-admin/
├── backend/
│   ├── app/
│   │   ├── core/          # Config, database, errors
│   │   ├── models/        # SQLAlchemy ORM models
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   ├── repositories/  # Database access layer
│   │   ├── services/      # Business logic
│   │   ├── integrations/  # External services (Ollama)
│   │   ├── routers/       # API endpoints
│   │   └── utils/         # Helpers and utilities
│   ├── alembic/           # Database migrations
│   ├── tests/             # Backend tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/           # API client functions
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── schemas/       # Zod validation schemas
│   │   ├── types/         # TypeScript types
│   │   └── lib/           # Utilities
│   ├── Dockerfile
│   └── package.json
├── docs/                   # Project documentation
├── docker-compose.yml
├── .env.example
└── README.md
```

## Key Features

### AI-Assisted Product Onboarding
Upload a product image and get structured AI suggestions for all product metadata fields. Each field shows a confidence percentage so you know what to review carefully.

### Human-in-the-Loop
AI never makes the final decision. Every suggested field is editable. Low-confidence suggestions are highlighted for review.

### Product Preview
Preview how the product page would look before saving. The preview uses your current edits, not just saved data.

### Product Chat
Ask the AI questions about a product image — clarify style, material estimates, or category choices in a conversational interface.

### Full Product Lifecycle
Create drafts, edit, preview, publish, and archive products. Filter and search through your product catalog.

## Development

### Backend Development

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Running Tests

```bash
# Backend tests (inside Docker)
docker compose exec backend python -m pytest tests/ -v

# Backend tests (local)
cd backend && pytest

# Frontend type check
docker compose exec frontend npx tsc --noEmit
```

### Database Migrations

```bash
cd backend

# Generate a new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Service health check |
| POST | /api/v1/uploads/images | Upload product image |
| POST | /api/v1/ai/analyze | Run AI analysis on image |
| POST | /api/v1/ai/chat | Chat with AI about product |
| GET | /api/v1/ai/chat/history | Get chat history |
| GET | /api/v1/products | List products |
| POST | /api/v1/products | Create product |
| GET | /api/v1/products/{id} | Get product detail |
| PATCH | /api/v1/products/{id} | Update product |
| DELETE | /api/v1/products/{id} | Archive product |
| POST | /api/v1/products/{id}/publish | Publish product |
| POST | /api/v1/products/{id}/draft | Revert to draft |

## Documentation

Detailed documentation is available in the `docs/` folder:

- [Product Requirements](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [API Specification](docs/API_SPEC.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [AI Strategy](docs/AI_STRATEGY.md)
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)
- [UX Guide](docs/UX_GUIDE.md)
- [Testing Strategy](docs/TESTING_STRATEGY.md)
- [Agent Rules](docs/AGENT_RULES.md)

## Architecture Decisions

- **AI prompt is backend-only**: The frontend never sees or sends the system prompt
- **Three-layer data storage**: Raw AI output → Normalized suggestions → Admin-approved final values
- **Confidence-driven UI**: Every AI field shows how confident the model is
- **Graceful degradation**: AI failures never block manual product creation
- **Local-first storage**: Images stored locally in development, designed for S3 migration
- **Image resizing for AI**: Large images (>1024px) are automatically resized before sending to the VLM
- **Magic byte validation**: File uploads are validated by magic bytes, not just Content-Type headers
- **Toast notifications**: Success/error feedback via non-blocking toast messages
- **Mobile responsive**: Sidebar collapses with hamburger menu on mobile viewports
- **Error boundary**: Unhandled errors show a recovery UI instead of a blank page

## Test Coverage

| Area | Tests | Status |
|------|-------|--------|
| AI Validation (parse, normalize, repair JSON) | 23 | Passing |
| Ollama Client (mock, timeout, error) | 4 | Passing |
| Image Uploads (JPEG, PNG, invalid, no-file) | 4 | Passing |
| Frontend TypeScript | - | Compiles clean |
| **Total** | **33** | **All passing** |

## License

Private project — all rights reserved.
