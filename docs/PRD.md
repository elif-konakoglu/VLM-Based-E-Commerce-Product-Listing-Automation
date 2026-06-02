# Product Requirements Document

## Product Name

AI Textile Product Admin Dashboard

## Version

1.0.0

## Last Updated

2026-06-01

## Purpose

This project is an admin-only e-commerce management dashboard for textile and clothing products. The primary goal is to accelerate product onboarding by using a vision-language model (VLM) to analyze uploaded product images and generate structured metadata suggestions including categorization, descriptions, tags, colors, style attributes, material estimates, and marketing copy.

The AI never makes the final decision. The admin reviews, edits, previews, and approves all product data before saving or publishing.

## Problem Statement

Manual product data entry for textile and clothing e-commerce is time-consuming and error-prone. Each product requires consistent categorization, accurate descriptions, relevant tags, and compelling marketing copy. A vision-language model can dramatically speed up this process while maintaining human oversight for quality control.

## User Type

### Admin

The only user type in this system. No public-facing buyer interface exists.

Admins can:

- Upload one or more textile or clothing product images
- Select a main product image from the gallery
- Generate AI suggestions from the main product image
- Review confidence scores for each AI-suggested field
- Edit every AI-generated field before saving
- Chat with the VLM about a specific product image
- Preview the product page as an end-user would see it
- Save products as draft
- Publish products
- Archive products
- Manage existing products (list, view detail, edit, delete)

## Non-Goals

This project explicitly excludes:

- Buyer-facing storefront or public website
- Shopping cart or checkout flow
- Payment processing or order management
- Customer accounts or authentication for buyers
- Public SEO-indexed pages
- Marketplace functionality
- Inventory management or reservation system
- Multi-tenant or multi-admin role management (single admin role for MVP)
- Real-time collaboration between multiple admins

## Core Workflow

1. Admin opens the dashboard and navigates to "New Product"
2. Admin uploads one or more product images (JPEG, PNG, or WebP)
3. System stores image files and metadata
4. Admin selects the main product image from the gallery
5. Admin clicks "Analyze with AI"
6. Backend encodes the main image as base64 and sends it to the Ollama-compatible VLM
7. Backend receives and validates the model's JSON response
8. Backend normalizes the response, repairs minor issues if safe, and stores both raw and normalized outputs
9. Frontend displays structured AI suggestions with confidence percentages per field
10. Admin reviews suggestions, edits any fields as needed
11. Admin optionally chats with the VLM for clarification about the product
12. Admin opens product preview to verify how the product page would appear
13. Admin saves the product as draft or publishes it directly
14. System stores admin-approved final product data separately from AI suggestions

## AI Suggestion Fields

The VLM analyzes the product image and returns structured suggestions for:

| Field | Type | Description |
|-------|------|-------------|
| main_category | string | Primary product category (e.g., Women Clothing, Men Clothing) |
| target_audience | enum | One of: women, men, children, baby, unisex, home, fabric |
| subcategory | string | Specific product type (e.g., Dress, Blouse, Jacket) |
| tags | string[] | Relevant descriptive tags for the product |
| color | string[] | Visible colors detected in the image |
| texture | string | Fabric texture description |
| pattern | string | Visual pattern description |
| length_type | string | Estimated garment length (e.g., midi, maxi, cropped) |
| fit_type | string | Estimated fit (e.g., regular, slim, oversized) |
| style | string | Fashion style description (e.g., casual, formal, bohemian) |
| material_guess | string | Visual material estimate (never claims certainty) |
| short_marketing_title | string | SEO-optimized title, max 70 characters |
| marketing_description | string | 2-3 sentence marketing description |
| bullet_points | string[] | 3-5 benefit-focused bullet points |

Each field includes:

- `value`: The AI-suggested content
- `confidence_percentage`: A string from "0%" to "100%"

## Human-in-the-Loop Requirements

- AI output is presented as suggestions, never as decisions
- Every suggested field must be editable by the admin
- Admin-approved final data is the single source of truth
- Confidence percentage is visible for every AI-generated field
- Low-confidence fields (below 50%) are visually highlighted for careful review
- Admin can ignore, modify, or fully replace any AI suggestion
- System stores enough data to compare AI suggestions with admin-approved final values
- Admin must explicitly save or publish; no auto-save of AI suggestions

## Product Statuses

| Status | Description |
|--------|-------------|
| draft | Product created but not publicly available |
| published | Product is finalized and marked as live |
| archived | Product is soft-deleted and hidden from active lists |

## Key Screens

### Dashboard Home

Displays:

- Total product count
- Draft count
- Published count
- Recently created/updated products
- Recent AI analyses summary
- AI error count or recent failures (if any)

### Product List

Displays:

- Product image thumbnail
- Title
- Category
- Status badge (draft/published/archived)
- Last updated date
- Quick actions (edit, view, archive)
- Filtering by status
- Search by title or category
- Pagination

### New Product (Create)

Includes:

- Image upload zone (drag-and-drop + click)
- Uploaded image gallery with thumbnails
- Main image selector
- "Analyze with AI" button with loading state
- AI suggestion panel with confidence badges
- Editable product form (React Hook Form + Zod validation)
- Product chat panel (collapsible)
- Preview button
- Save Draft button
- Publish button

### Product Edit

Same layout as New Product, but pre-populated with saved product data. Shows which fields were AI-suggested vs. manually entered.

### Product Preview

Admin-only preview simulating an end-user product page:

- Large product image(s) with gallery
- Product title
- Category and subcategory
- Full marketing description
- Bullet points
- Color swatches or labels
- Pattern and texture info
- Material estimate
- Style tags
- Clear "ADMIN PREVIEW" indicator

### Product Detail

Read-only view of a saved product with all metadata, images, and audit information.

## Success Criteria

- Admin can complete the full workflow: image upload → AI analysis → edit → preview → save
- AI suggestions appear as structured, editable fields with confidence percentages
- Invalid AI JSON does not crash the application; graceful error with retry option
- Product preview accurately reflects current admin-edited form data (not just saved data)
- AI prompt is never exposed to the frontend
- The entire system runs with a single `docker compose up` command
- Backend tests pass for AI validation, response parsing, and product CRUD
- The UI is polished, responsive, and suitable for daily internal admin use

## Constraints

- Must use the specified tech stack (React/Vite, FastAPI, PostgreSQL, etc.)
- Ollama endpoint URL must be configurable (not hardcoded)
- Image storage is local volume for development, designed for future S3 migration
- No authentication required for MVP (single-admin assumption)
- System must handle VLM failures gracefully without data loss
