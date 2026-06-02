# Agent Rules

## Primary Directive

Build a working, maintainable, production-quality product. Avoid over-engineering, but do not create throwaway code. Every file should be intentionally structured and reasonably tested.

## Documentation First

Before implementing any phase, the corresponding documentation must exist:

- docs/PRD.md — Product requirements
- docs/ARCHITECTURE.md — System design
- docs/API_SPEC.md — Endpoint contracts
- docs/DATABASE_SCHEMA.md — Schema with design decisions
- docs/AI_STRATEGY.md — Prompt, model config, validation rules
- docs/UX_GUIDE.md — Layout, components, design system
- docs/TESTING_STRATEGY.md — Test plan and coverage goals
- docs/IMPLEMENTATION_PLAN.md — Phased delivery plan
- docs/AGENT_RULES.md — This file
- README.md — Setup and run instructions

Update documentation when implementation decisions diverge from initial plans.

## AI System Rules

- The AI prompt lives exclusively in backend code
- Frontend must never receive, display, or edit the system prompt
- Admin must never be forced to accept AI suggestions
- All VLM output must be validated before storage or display
- Store raw AI output for auditability (never modify after storage)
- Store normalized suggestions separately from raw output
- Store admin-approved final product values as the source of truth
- Model parameters (temperature, top_p, etc.) must be configurable via environment variables
- The agent may optimize prompt wording, model options, and validation logic
- Prompt changes must increment the prompt version identifier

## UX Rules

- Every AI-suggested field must be editable by the admin
- Every AI-suggested field must display its confidence percentage
- Product preview must render from current unsaved form state
- Low-confidence suggestions (< 50%) must be visually highlighted
- Error messages must tell the admin what they can do next
- Loading states must be visible for all async operations
- Empty states must be helpful and actionable
- The UI must work on desktop and be usable on tablet/mobile

## Backend Rules

- Use FastAPI with async endpoints
- Use Pydantic v2 for all request/response schemas
- Use SQLAlchemy 2.x with async session support
- Use Alembic for all database migrations
- Use layered architecture: routers → services → repositories
- Keep integrations (Ollama client) isolated from business logic
- Use environment variables for all configuration (never hardcode)
- Return structured error responses (code + message + details)
- Add tests for AI parsing, validation, and critical endpoints
- Use dependency injection via FastAPI's Depends()

## Frontend Rules

- Use React with TypeScript (strict mode)
- Use Vite for build tooling
- Use TanStack Query for server state management
- Use React Hook Form for form state
- Use Zod for schema validation
- Use Tailwind CSS + shadcn/ui for styling
- Keep components typed, reusable, and composable
- Never store or reference backend prompts in frontend code
- Use clear loading, error, and empty states everywhere
- Use proper TypeScript types (avoid `any`)

## Docker Rules

- All services must run with a single `docker compose up --build`
- docker-compose.yml includes: frontend, backend, postgres, redis
- Ollama base URL must be configurable (default: host.docker.internal:11434)
- Never hardcode ngrok or tunnel URLs
- Include `.env.example` with all required variables documented
- Use multi-stage builds for production-sized images where beneficial
- Mount source code as volumes for development hot-reload

## Code Quality Rules

- No unused imports or dead code
- No hardcoded secrets or credentials
- No console.log in production frontend code (use proper logging)
- No raw SQL in application code (use ORM)
- No business logic in routers (delegate to services)
- No database access in services (delegate to repositories)
- Meaningful variable and function names
- Files under 300 lines where possible (split if larger)
- One responsibility per file/class/function

## Error Handling Rules

- Never let unhandled errors crash the application
- Backend: use exception handlers to return structured JSON errors
- Frontend: use error boundaries for component failures
- AI failures: show clear message + retry option + manual fallback
- Network failures: show clear message + retry option
- Validation failures: show field-level error messages

## Security Rules

- Validate file uploads server-side (magic bytes, not just extension)
- Restrict upload file size
- Never expose file system paths in API responses
- Never expose AI prompts to frontend
- Sanitize AI-generated text before HTML rendering
- Treat all VLM output as untrusted
- Design for easy authentication addition (middleware pattern)

## Completion Definition

The project is considered complete when:

1. `docker compose up --build` starts the full stack without errors
2. Admin can upload product images
3. Admin can run AI analysis and see suggestions with confidence
4. Admin can edit every suggested field
5. Admin can preview the product page from current form state
6. Admin can save products as draft
7. Admin can publish products
8. Admin can chat with the model about a product image
9. Product list, detail, and edit pages work correctly
10. Backend tests pass for AI validation and product CRUD
11. Error states are handled gracefully (AI failure, network issues)
12. README provides working setup instructions
