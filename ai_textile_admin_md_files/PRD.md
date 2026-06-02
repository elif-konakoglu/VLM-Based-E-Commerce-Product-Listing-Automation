# Product Requirements Document

## Product Name

AI Textile Product Admin Dashboard

## Purpose

This project is an admin-only e-commerce management dashboard for textile and clothing products.

The main purpose is to speed up product creation by using a vision-language model to analyze product images and suggest product metadata, categorization, and marketing copy.

The AI never makes the final decision. The admin reviews, edits, previews, and saves the final product data.

## User Type

### Admin

The only user type in this project.

Admins can:

- Upload textile or clothing product images
- Generate AI suggestions from product images
- Review confidence scores
- Edit every generated field
- Chat with the VLM about a product image
- Preview the product page before saving
- Save products as draft
- Publish products
- Manage existing products

## Non-Goals

The project does not include:

- Buyer-facing storefront
- Shopping cart
- Checkout
- Payment system
- Customer accounts
- Public SEO pages
- Marketplace behavior
- Inventory reservation
- Payment or order management

## Core Workflow

1. Admin opens the dashboard.
2. Admin clicks “New Product”.
3. Admin uploads one or more product images.
4. Admin selects the main image.
5. Backend stores image metadata and file.
6. Admin clicks “Analyze with AI”.
7. Backend sends the image to an Ollama-compatible VLM.
8. Backend receives model output.
9. Backend validates, repairs if safe, and normalizes the model response.
10. Frontend displays suggestions with confidence percentages.
11. Admin edits any field.
12. Admin opens product preview.
13. Admin saves product as draft or publishes it.

## AI Suggestion Fields

The agent may refine the final schema, but the MVP should support at least these fields:

- main category
- target audience
- subcategory or product type
- tags
- color
- texture
- pattern
- length type
- fit type
- style
- visual material estimate
- short marketing title
- marketing description
- bullet points

Each suggested field should include:

- value
- confidence percentage

## Human-in-the-Loop Requirements

- AI output must be presented as suggestions.
- Every suggested field must be editable.
- Admin-approved final data is the source of truth.
- Confidence percentage must be visible for every AI-generated field.
- Low-confidence fields should be visually highlighted.
- Admin must be able to ignore or override AI suggestions.
- Store enough data to compare AI suggestions with admin-approved final values.

## Product Statuses

Recommended statuses:

- draft
- published
- archived

The agent may add more statuses if beneficial.

## Key Screens

### Dashboard Home

Shows:

- Product count
- Draft count
- Published count
- Recent products
- Recent AI analyses
- AI error count or recent failures if useful

### Product List

Shows:

- Product image thumbnail
- Title
- Category
- Status
- Updated date
- Actions

### New Product

Includes:

- Image upload
- Uploaded image gallery
- Main image selector
- AI analysis button
- AI suggestion form
- Product chat panel
- Preview button
- Save draft button
- Publish button

### Product Edit

Same as new product flow, but loads saved product data.

### Product Preview

Admin-side preview of how the product would look to an end user.

Should show:

- Product images
- Product title
- Category
- Description
- Bullet points
- Color
- Pattern
- Texture
- Material estimate
- Style tags

## Success Criteria

- Admin can create a product from image upload to saved draft.
- AI suggestions appear in structured editable fields.
- Confidence percentages are visible for every AI-generated field.
- Invalid AI JSON does not crash the app.
- Product preview accurately reflects admin-edited data.
- AI prompt is never exposed to frontend.
- The system runs with Docker Compose.
