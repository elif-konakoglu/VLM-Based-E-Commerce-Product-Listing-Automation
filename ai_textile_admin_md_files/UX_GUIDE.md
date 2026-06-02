# UX Guide

## Design Principles

- Admin-first, not shopper-first.
- AI suggestions should feel helpful but not authoritative.
- Confidence should be visible without clutter.
- Editing should be fast.
- Preview should build trust before saving.
- The final product data must clearly feel admin-approved.

## Visual Style

Use a modern, clean SaaS admin style:

- left sidebar
- top header
- card-based layout
- soft borders
- readable spacing
- strong empty states
- clear primary actions

## New Product Page Layout

Recommended layout:

```text
----------------------------------------------------
Header: New Product
Actions: Preview | Save Draft | Publish
----------------------------------------------------
Left column:
  Image upload
  Uploaded image gallery
  Main image selector
  Analyze with AI button
  AI status/errors

Right column:
  Editable product fields
  Confidence badges
  Human review indicators

Bottom or side panel:
  Product chat with VLM
----------------------------------------------------
```

## Confidence UI

Show confidence badges:

- 80–100%: High
- 50–79%: Medium
- 0–49%: Low

Example:

```text
Main Category
[Women Clothing] [94% High]
```

For low confidence:

- show warning icon
- show helper text: “Review carefully”
- avoid blocking the admin

## Human-in-the-Loop Copy

Use copy such as:

- “AI suggestion”
- “Review before saving”
- “Admin-approved final value”
- “Low confidence — please verify”
- “This field can be edited”

Avoid copy such as:

- “AI decision”
- “Final AI category”
- “Automatically approved”

## Product Form Fields

Recommended editable fields:

- main category
- target audience
- subcategory
- tags
- colors
- texture
- pattern
- length type
- fit type
- style
- material estimate
- marketing title
- marketing description
- bullet points

## Preview

The preview should use current unsaved form values.

Preview should show:

- large image
- product title
- category
- description
- bullet points
- tags
- colors
- style details

The preview should be clearly labeled as an admin preview.

## Chat UX

Panel title:

```text
Ask AI about this product
```

Input placeholder:

```text
Ask about category, style, material estimate, colors, or description...
```

AI answers should be visibly separated from admin messages.

## Empty States

Use helpful empty states:

- “Upload a product image to begin.”
- “Run AI analysis to generate suggestions.”
- “No products yet. Create your first product.”
- “AI could not generate suggestions. You can retry or fill the fields manually.”

## Loading States

Show clear progress for:

- image upload
- AI analysis
- product save
- publish action
- chat response
