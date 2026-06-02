# Agent Rules

## Primary Rule

Build a working, maintainable product. Do not over-engineer, but do not create throwaway code.

## Documentation First

Before implementation, create:

- PRD
- Architecture
- API spec
- Database schema decision
- AI strategy
- UX guide
- Testing strategy
- README

Update the docs when implementation decisions change.

## AI Rules

- The AI prompt must live only in backend code.
- The frontend must never receive or edit the prompt.
- The admin must never be forced to accept AI suggestions.
- AI output must be validated.
- Store raw AI output server-side.
- Store normalized suggestions.
- Store admin-approved final product values separately.
- Model parameters should be configurable.
- You may optimize prompt and model parameters.

## UX Rules

- Every AI-suggested field must be editable.
- Every AI-suggested field must show confidence.
- Product preview must use current form state.
- Low-confidence suggestions should be highlighted.
- Errors should explain what admin can do next.

## Backend Rules

- Use FastAPI.
- Use Pydantic v2.
- Use SQLAlchemy 2.x.
- Use Alembic.
- Use layered architecture.
- Keep integrations isolated.
- Use environment variables.
- Add structured errors.
- Add tests for AI parsing and validation.

## Frontend Rules

- Use React TypeScript.
- Use Vite.
- Use TanStack Query.
- Use React Hook Form.
- Use Zod.
- Keep components typed and reusable.
- Avoid storing backend prompts in frontend.
- Use clear loading and error states.

## Docker Rules

- Everything must run with Docker Compose.
- Include frontend, backend, postgres, and redis.
- Ollama base URL must be configurable.
- Do not hardcode ngrok URL.
- Include `.env.example`.

## Completion Definition

The project is complete when:

- Docker Compose starts the stack.
- Admin can upload image.
- Admin can run AI analysis.
- Admin can edit suggestions.
- Admin can preview product page.
- Admin can save draft.
- Admin can publish product.
- Admin can chat with the model about product image.
- Backend tests for AI validation pass.
