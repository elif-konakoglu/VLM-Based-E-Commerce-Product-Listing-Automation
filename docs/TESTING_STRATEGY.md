# Testing Strategy

## Overview

Testing focuses on the areas with highest risk: AI response parsing, validation logic, and data integrity. The approach is pragmatic — comprehensive backend tests for critical paths, selective frontend tests for complex components.

## Test Framework

| Layer | Framework | Runner |
|-------|-----------|--------|
| Backend | pytest + pytest-asyncio | pytest |
| Backend HTTP | httpx (AsyncClient) | pytest |
| Mocking | unittest.mock + pytest-mock | pytest |
| Frontend | Vitest + React Testing Library | vitest |
| E2E (optional) | Playwright | playwright |

## Backend Tests

### Directory Structure

```text
backend/tests/
├── conftest.py              # Shared fixtures, test DB setup
├── test_ai_validation.py    # AI response schema validation
├── test_ollama_client.py    # Ollama HTTP client (mocked)
├── test_ai_service.py       # AI analysis orchestration
├── test_products.py         # Product CRUD endpoints
├── test_uploads.py          # Image upload endpoints
├── test_chat.py             # Chat endpoints
└── fixtures/
    ├── valid_ai_response.json
    ├── partial_ai_response.json
    ├── invalid_ai_response.json
    └── sample_image.jpg
```

### AI Schema Validation Tests

These are the highest-priority tests — they protect against unpredictable VLM output.

| Test Case | Expected Behavior |
|-----------|-------------------|
| Valid complete response | Passes validation, all fields present |
| Missing single field | Field filled with null value, 0% confidence |
| Missing multiple fields | Partial response accepted, missing filled |
| Invalid target_audience value | Normalized or flagged as low confidence |
| Confidence as number (85 instead of "85%") | Normalized to "85%" |
| Confidence as float ("0.85") | Normalized to "85%" |
| Confidence > 100% | Clamped to "100%" |
| Confidence negative | Clamped to "0%" |
| tags as string instead of array | Wrapped in array |
| color as string instead of array | Wrapped in array |
| bullet_points as string | Wrapped in array |
| Empty tags array | Accepted as-is |
| Title > 70 characters | Truncated with "..." |
| Completely empty JSON | Marked as failed |
| Non-JSON string response | Marked as failed after retry |
| JSON with extra unexpected fields | Extra fields ignored, valid fields extracted |
| Nested incorrect structure | Best-effort extraction |
| Unicode/special characters in values | Accepted and stored correctly |

### Ollama Client Tests (Mocked HTTP)

| Test Case | Expected Behavior |
|-----------|-------------------|
| Successful JSON response | Returns parsed suggestions |
| HTTP timeout (>120s) | Raises timeout error with AI_TIMEOUT code |
| HTTP 500 from Ollama | Raises AI_UNAVAILABLE error |
| Connection refused | Raises AI_UNAVAILABLE error |
| Invalid JSON in response field | Raises AI_INVALID_JSON error |
| Empty response field | Raises AI_INVALID_JSON error |
| Missing "response" key in envelope | Raises AI_INVALID_JSON error |
| Response with "done": false | Handle gracefully |
| Very large response (>100KB) | Accept within limits |

### Product API Tests

| Test Case | Expected Behavior |
|-----------|-------------------|
| Create draft product with all fields | 201, product stored |
| Create product with minimal fields | 201, nullable fields are null |
| Create product without required status | 422 validation error |
| Update product title only | Only title changes |
| Update product tags | Tags replaced |
| List products (no filter) | Returns all non-archived |
| List products by status | Returns filtered set |
| Search products by title | Returns matches |
| Get product detail | Returns full product with images |
| Publish draft product | Status → published, published_at set |
| Publish already-published product | Idempotent or error |
| Move published to draft | Status → draft |
| Archive product | Status → archived, archived_at set |
| Get archived product | Still accessible by ID |
| Pagination (limit/offset) | Returns correct page |

### Upload Tests

| Test Case | Expected Behavior |
|-----------|-------------------|
| Upload valid JPEG | 201, metadata returned with dimensions |
| Upload valid PNG | 201, metadata returned |
| Upload valid WebP | 201, metadata returned |
| Upload non-image file (PDF) | 415 UPLOAD_INVALID_TYPE |
| Upload oversized file | 413 UPLOAD_TOO_LARGE |
| Upload with no file | 422 validation error |
| Upload file with wrong extension but valid magic bytes | Accepted (magic byte check) |
| Upload file with valid extension but invalid magic bytes | 415 rejected |

### Chat Tests

| Test Case | Expected Behavior |
|-----------|-------------------|
| Send chat with image_id and message | Returns AI reply |
| Send chat with product context | Context included in model prompt |
| Get chat history | Returns ordered messages |
| Model failure on chat | Returns error without crash |
| Chat messages persisted | Retrievable after creation |
| Empty message | 422 validation error |

## Frontend Tests

### Directory Structure

```text
frontend/src/__tests__/
├── components/
│   ├── ConfidenceBadge.test.tsx
│   ├── ProductForm.test.tsx
│   ├── ImageUploader.test.tsx
│   └── ProductPreview.test.tsx
└── utils/
    └── confidence.test.ts
```

### Component Tests

| Component | Test Cases |
|-----------|-----------|
| ConfidenceBadge | Renders high/medium/low variants correctly |
| ConfidenceBadge | Shows warning icon for low confidence |
| ConfidenceBadge | Handles edge values (0%, 100%) |
| ProductForm | Validates required fields |
| ProductForm | Shows AI suggestions when provided |
| ProductForm | Allows editing all fields |
| ProductPreview | Renders current form values |
| ProductPreview | Shows admin preview indicator |
| ImageUploader | Accepts valid file types |
| ImageUploader | Shows error for invalid files |

## Test Data and Fixtures

### AI Response Fixtures

Maintain JSON fixtures representing:
- Perfect model response (all fields valid)
- Partial response (some fields missing)
- Malformed response (wrong types, invalid confidence)
- Real model outputs collected during development

### Test Database

- Use a separate PostgreSQL database for tests
- Run migrations before test suite
- Clean tables between tests (or use transactions)
- Fixtures for products, images, analyses

## Test Running

### Backend

```bash
# Run all tests
cd backend && pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_ai_validation.py

# Run with verbose output
pytest -v
```

### Frontend

```bash
# Run all tests
cd frontend && npm run test

# Run with coverage
npm run test -- --coverage

# Run in watch mode
npm run test -- --watch
```

## CI Integration (Future)

When CI is added:
- Run backend tests on every push
- Run frontend tests on every push
- Require passing tests for merge
- Generate coverage reports
- Fail if coverage drops below threshold (e.g., 70% for backend)

## Manual QA Checklist

Complete this checklist for each release:

- [ ] Start system with `docker compose up --build`
- [ ] Open http://localhost:5173
- [ ] Navigate to New Product
- [ ] Upload a product image (JPEG)
- [ ] Upload a second image (PNG)
- [ ] Select main image
- [ ] Click "Analyze with AI"
- [ ] Wait for analysis to complete
- [ ] Verify all suggestion fields have confidence badges
- [ ] Verify low-confidence fields are highlighted
- [ ] Edit at least 3 fields manually
- [ ] Open product preview
- [ ] Verify preview shows edited values
- [ ] Close preview
- [ ] Save as draft
- [ ] Navigate to product list
- [ ] Verify product appears in list
- [ ] Open product for editing
- [ ] Verify saved values are loaded
- [ ] Publish product
- [ ] Verify status changes to "Published"
- [ ] Open chat panel
- [ ] Ask a question about the product
- [ ] Verify AI responds
- [ ] Stop Ollama service
- [ ] Attempt AI analysis
- [ ] Verify graceful error message appears
- [ ] Verify manual product creation still works
- [ ] Restart Ollama
- [ ] Verify retry works after restart
