# Database Schema

## Design Decisions

### Decision 1: Confidence Storage

**Chosen approach:** Store confidence as a JSONB map on the `ai_analyses.normalized_response` field.

**Rationale:** For MVP, a JSONB map is simpler to query and display. Each field in the normalized response already contains `{ value, confidence_percentage }`. A separate `product_field_confidences` table adds unnecessary joins without clear benefit at this scale.

### Decision 2: Raw vs. Final Data Separation

**Chosen approach:** Store three levels of data:
1. `ai_analyses.raw_response` — Exact model output, never modified
2. `ai_analyses.normalized_response` — Backend-validated and normalized suggestions
3. `products.*` fields — Admin-approved final values

**Rationale:** This enables full auditability: compare what the model said, what the system normalized, and what the admin approved.

### Decision 3: Product Preview

**Chosen approach:** Product preview uses unsaved frontend form state (client-side only).

**Rationale:** Preview does not require a database round-trip. The frontend renders the preview from current form values, giving instant feedback without creating draft records.

### Decision 4: Image-Product Relationship

**Chosen approach:** Many-to-many via `product_image_links` junction table with sort order.

**Rationale:** An image may be uploaded before a product exists. Multiple products could theoretically reference the same image. Sort order supports image gallery ordering.

---

## Tables

### product_images

Stores uploaded product image metadata.

```sql
CREATE TABLE product_images (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename        TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    storage_path    TEXT NOT NULL,
    public_url      TEXT NOT NULL,
    content_type    TEXT NOT NULL,
    size_bytes      INTEGER NOT NULL,
    width           INTEGER,
    height          INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_created_at ON product_images(created_at DESC);
```

### ai_analyses

Stores VLM analysis results, both raw and normalized.

```sql
CREATE TABLE ai_analyses (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_id            UUID NOT NULL REFERENCES product_images(id) ON DELETE CASCADE,
    model               TEXT NOT NULL,
    provider            TEXT NOT NULL DEFAULT 'ollama',
    prompt_version      TEXT NOT NULL,
    model_options       JSONB NOT NULL DEFAULT '{}',
    raw_response        JSONB,
    normalized_response JSONB,
    status              TEXT NOT NULL DEFAULT 'pending',
    error_code          TEXT,
    error_message       TEXT,
    latency_ms          INTEGER,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_analyses_image_id ON ai_analyses(image_id);
CREATE INDEX idx_ai_analyses_status ON ai_analyses(status);
CREATE INDEX idx_ai_analyses_created_at ON ai_analyses(created_at DESC);
```

**Status values:** `pending`, `processing`, `completed`, `failed`

**Important notes:**
- `raw_response` stores the exact JSON from the model (for auditing)
- `normalized_response` stores the validated/cleaned version returned to frontend
- `prompt_version` tracks which prompt produced this analysis
- `model_options` stores temperature, top_p, etc. used for this run

### products

Stores admin-approved final product data.

```sql
CREATE TABLE products (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status                  TEXT NOT NULL DEFAULT 'draft',
    main_image_id           UUID REFERENCES product_images(id) ON DELETE SET NULL,
    ai_analysis_id          UUID REFERENCES ai_analyses(id) ON DELETE SET NULL,
    main_category           TEXT,
    target_audience         TEXT,
    subcategory             TEXT,
    tags                    JSONB NOT NULL DEFAULT '[]',
    color                   JSONB NOT NULL DEFAULT '[]',
    texture                 TEXT,
    pattern                 TEXT,
    length_type             TEXT,
    fit_type                TEXT,
    style                   TEXT,
    material_guess          TEXT,
    short_marketing_title   TEXT,
    marketing_description   TEXT,
    bullet_points           JSONB NOT NULL DEFAULT '[]',
    confidence_snapshot     JSONB,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at            TIMESTAMPTZ,
    archived_at             TIMESTAMPTZ
);

CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_updated_at ON products(updated_at DESC);
CREATE INDEX idx_products_main_category ON products(main_category);
```

**Notes:**
- `status` values: `draft`, `published`, `archived`
- `confidence_snapshot` stores the confidence values at the time of save (captures what the admin saw)
- `ai_analysis_id` links to the AI analysis that generated suggestions (if any)
- All text fields are nullable to support manual-only product creation

### product_image_links

Junction table for many-to-many product-image relationship.

```sql
CREATE TABLE product_image_links (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_id    UUID NOT NULL REFERENCES product_images(id) ON DELETE CASCADE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(product_id, image_id)
);

CREATE INDEX idx_product_image_links_product_id ON product_image_links(product_id);
CREATE INDEX idx_product_image_links_image_id ON product_image_links(image_id);
```

### product_chat_messages

Stores admin-VLM chat history per product/image.

```sql
CREATE TABLE product_chat_messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
    image_id    UUID REFERENCES product_images(id) ON DELETE SET NULL,
    role        TEXT NOT NULL,
    message     TEXT NOT NULL,
    model       TEXT,
    metadata    JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_product_id ON product_chat_messages(product_id);
CREATE INDEX idx_chat_messages_image_id ON product_chat_messages(image_id);
CREATE INDEX idx_chat_messages_created_at ON product_chat_messages(created_at);
```

**Role values:** `admin`, `assistant`, `system`

---

## Entity Relationship Diagram

```text
product_images
    │
    ├──< ai_analyses (image_id)
    │
    ├──< product_image_links (image_id)
    │         │
    │         ▼
    │     products (main_image_id, ai_analysis_id)
    │
    └──< product_chat_messages (image_id)
              │
              ▼
         products (product_id)
```

## Migration Strategy

- Use Alembic for all schema migrations
- Initial migration creates all tables
- Each subsequent schema change gets its own migration file
- Never modify existing migration files
- Downgrade support required for development

## Data Integrity Rules

- Deleting an image cascades to its AI analyses and removes image links
- Deleting a product cascades to its image links
- Archiving a product is a soft delete (status change, not row deletion)
- Chat messages persist even if product is archived
- AI analyses persist for full audit trail
