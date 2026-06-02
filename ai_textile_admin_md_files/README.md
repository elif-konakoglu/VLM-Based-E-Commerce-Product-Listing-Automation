# AI Textile Product Admin Dashboard

Admin-only e-commerce product management dashboard for textile and clothing products.

The system uses an Ollama-compatible vision-language model to analyze uploaded product images and suggest product categorization, descriptions, tags, colors, style, material estimate, and marketing copy.

AI suggestions are never final. Admins review, edit, preview, and approve all product data.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- FastAPI
- PostgreSQL
- Redis
- SQLAlchemy
- Alembic
- Pydantic
- Docker Compose
- Ollama-compatible VLM API

## Main Features

- Admin dashboard
- Product image upload
- AI product analysis
- Editable AI suggestions
- Confidence percentage per field
- Product-specific AI chat
- Product preview before save
- Draft and publish workflow
- Product list and edit pages

## Environment Variables

Create `.env` from `.env.example`.

```env
POSTGRES_DB=products
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DATABASE_URL=postgresql+psycopg://postgres:postgres@postgres:5432/products

REDIS_URL=redis://redis:6379/0

OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_MODEL=qwen2.5vl:7b
OLLAMA_TIMEOUT_SECONDS=120
OLLAMA_TEMPERATURE=0.2
OLLAMA_TOP_P=
OLLAMA_TOP_K=
OLLAMA_REPEAT_PENALTY=

BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000

FRONTEND_PORT=5173

MEDIA_ROOT=/app/media
MAX_UPLOAD_MB=10
```

## Docker Startup

```bash
docker compose up --build
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:8000
```

API docs:

```text
http://localhost:8000/docs
```

## Ollama

Make sure Ollama is running and the model is available:

```bash
ollama pull qwen2.5vl:7b
```

The backend calls an Ollama-compatible endpoint such as:

```text
POST /api/generate
```

## Development Notes

The AI prompt is stored in backend code only.

The frontend must never receive or edit the predefined AI prompt.

All AI output must be validated before being shown or saved.

The coding agent may optimize the prompt, model options, and database schema if the final implementation remains aligned with the product requirements.

## Human Review Policy

AI-generated values are suggestions.

Admin-approved product values are the source of truth.
