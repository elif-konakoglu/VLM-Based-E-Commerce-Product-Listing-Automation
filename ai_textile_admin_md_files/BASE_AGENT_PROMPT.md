# Base Agent Prompt

You are a senior full-stack engineer, product architect, UX designer, AI systems engineer, and codebase maintainer.

Create a production-ready admin dashboard project from scratch for an e-commerce textile and clothing product management system.

The system has only an admin dashboard. There is no public buyer-facing website. However, admins must be able to preview how a product page would look from an end-user perspective before saving or publishing the product.

## Core Product Goal

The core feature is AI-assisted product onboarding.

When an admin uploads a clothing or textile product image, the backend sends the image to a local Ollama-compatible vision-language model, currently planned as `qwen2.5vl:7b`, and receives structured suggestions for:

- Categorization
- Target audience
- Product type
- Tags
- Colors
- Texture
- Pattern
- Fit
- Length
- Style
- Visual material estimate
- SEO title
- Marketing description
- Benefit-focused bullet points

All AI-generated fields must be editable by the admin.

The AI output is only a suggestion. The admin always makes the final decision before saving or publishing the product.

Every AI-generated field must display a confidence percentage in the UI.

The app must also provide a product-specific chat interface where the admin can ask the VLM questions about the uploaded product image and the generated suggestions.

The AI prompt must live only in the backend. Admin users must not see, edit, or override the system prompt.

## Important Autonomy

You may improve the AI prompt, response schema, retry strategy, temperature, model options, validation approach, and prompt wording.

You may decide the final database schema as long as it supports the product requirements, auditability, and human-in-the-loop flow.

You may improve endpoint names, component structure, and implementation details using best practices.

Document your decisions in the relevant Markdown files before implementing them.

## Required Tech Stack

- Frontend: React + TypeScript + Vite
- UI: Tailwind CSS plus shadcn/ui or similarly polished component system
- State/data fetching: TanStack Query
- Forms: React Hook Form + Zod
- Backend: Python FastAPI
- Database: PostgreSQL
- Cache or queue support: Redis, only where useful
- ORM and migrations: SQLAlchemy 2.x + Alembic
- Validation: Pydantic v2
- Containerization: Docker + docker-compose
- Local model runtime: Ollama-compatible HTTP API
- File/image storage: local mounted volume for development, designed so S3-compatible storage can be added later

## Required Documentation Files

Before coding, create and maintain these files:

- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/API_SPEC.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/AI_STRATEGY.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/UX_GUIDE.md`
- `docs/TESTING_STRATEGY.md`
- `docs/AGENT_RULES.md`
- `README.md`

## Important Product Requirements

1. Admin can upload one or more product images.
2. Admin can select a main product image.
3. Admin can request AI analysis for the main product image.
4. AI returns structured suggestions.
5. Backend validates and normalizes the AI response.
6. Admin sees AI suggestions in an editable product form.
7. Each AI-suggested field shows its confidence percentage.
8. Admin can manually override every suggested field.
9. Admin can preview the product page before saving.
10. Admin can save product as draft.
11. Admin can publish product.
12. Admin can view product list, product detail, and edit products.
13. Admin can chat with the VLM about the uploaded product image.
14. AI prompt is backend-only and not editable from the UI.
15. Store original AI output, normalized suggestions, admin edits, and final saved product data.
16. Use robust error handling for model failures, invalid JSON, timeout, and unavailable Ollama endpoint.
17. Do not trust VLM output blindly. Validate all fields.
18. Make the UI polished, modern, responsive, and suitable for internal admin users.
19. Use clear separation between AI suggestions and final admin-approved product data.
20. Add basic tests for backend validation and AI response parsing.

## Engineering Requirements

Use a clean layered backend architecture:

- routers
- services
- repositories
- schemas
- models
- core config
- integrations

Use typed frontend components.

Keep API contracts explicit.

Use environment variables.

Include `.env.example`.

Include seed or demo data where useful.

Include health checks.

Include Dockerfiles for frontend and backend.

Include `docker-compose.yml` with frontend, backend, postgres, and redis.

Ollama must be configurable via `OLLAMA_BASE_URL`.

Do not hardcode the ngrok URL.

Do not expose the model prompt to frontend.

Use meaningful error messages in the admin UI.

## Model Integration Guidance

The existing experimental request shape is:

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

You may optimize:

- prompt content
- prompt versioning
- temperature
- top_p
- top_k
- repeat_penalty
- retries
- JSON extraction
- validation rules
- confidence scoring display
- fallback behavior

Keep all model options configurable from backend environment variables.

## Suggested Implementation Phases

1. Documentation and architecture decisions
2. Project scaffolding and Docker setup
3. Backend config, database, migrations
4. Product and image models
5. Ollama VLM integration
6. AI response validation and normalization
7. Product upload and suggestion endpoint
8. Product CRUD
9. Product chat endpoint
10. Frontend dashboard layout
11. Upload and AI suggestion flow
12. Editable human-in-the-loop product form
13. Confidence UI
14. Product preview page
15. Product list/detail/edit pages
16. Error handling, loading states, tests, and polish

Do not skip documentation.

Do not put the AI prompt in frontend code.

Do not make AI decisions final without admin confirmation.

Build the project incrementally and keep it runnable with Docker Compose.
