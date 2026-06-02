# Testing Strategy

## Backend Tests

Use pytest.

## AI Schema Validation Tests

Test:

- valid full response passes
- missing field fails or produces controlled error
- invalid target audience fails or normalizes safely
- invalid confidence format fails or normalizes safely
- non-array tags fail
- non-array colors fail
- non-array bullet points fail
- overlong title is rejected or trimmed according to documented rule

## Ollama Client Tests

Mock HTTP responses for:

- successful JSON response
- timeout
- 500 response
- invalid JSON
- empty response
- malformed response envelope
- unavailable Ollama base URL

## Product API Tests

Test:

- create draft product
- update product
- publish product
- move published product back to draft if allowed
- list products
- archive product
- get product detail

## Upload Tests

Test:

- accept JPEG
- accept PNG
- accept WEBP
- reject non-image file
- reject oversized image
- reject missing file

## Chat Tests

Test:

- chat request with product and image
- chat request with current product data
- model failure returns useful error
- chat messages are stored

## Frontend Testing

Recommended:

- confidence badge component test
- product form validation test
- preview renders current form state
- AI error display test
- upload empty state test

## Manual QA Checklist

- Start system with Docker Compose.
- Upload product image.
- Select main image.
- Run AI analysis.
- Confirm every suggested field has confidence.
- Edit every field manually.
- Preview unsaved changes.
- Save draft.
- Publish product.
- Reopen product edit page.
- Ask AI chat question.
- Stop Ollama and verify graceful error.
- Return invalid AI JSON and verify graceful error.
