# Database Schema

## Important Instruction

The coding agent may decide the final database schema.

The schema must support:

- product images
- AI analyses
- raw AI output storage
- normalized AI suggestions
- admin-approved final product data
- confidence values
- product chat history
- draft/published workflow
- future extensibility

## Recommended Tables

The following schema is recommended but not mandatory.

## product_images

Stores uploaded product images.

Suggested fields:

- id UUID primary key
- filename text
- original_filename text
- storage_path text
- public_url text
- content_type text
- size_bytes integer
- width integer nullable
- height integer nullable
- created_at timestamp
- updated_at timestamp

## ai_analyses

Stores AI model analysis results.

Suggested fields:

- id UUID primary key
- image_id UUID foreign key
- model text
- provider text
- prompt_version text
- model_options jsonb
- raw_response jsonb
- normalized_response jsonb
- status text
- error_code text nullable
- error_message text nullable
- latency_ms integer nullable
- created_at timestamp

Important:

- Store raw AI output for auditability.
- Store normalized response separately.
- Do not expose backend prompt text to frontend.
- Storing prompt version is recommended.

## products

Stores admin-approved final product data.

Suggested fields:

- id UUID primary key
- status text
- main_image_id UUID foreign key nullable
- ai_analysis_id UUID foreign key nullable
- main_category text
- target_audience text
- subcategory text
- tags jsonb
- color jsonb
- texture text
- pattern text
- length_type text
- fit_type text
- style text
- material_guess text
- short_marketing_title text
- marketing_description text
- bullet_points jsonb
- created_at timestamp
- updated_at timestamp
- published_at timestamp nullable
- archived_at timestamp nullable

## product_image_links

Allows multiple images per product.

Suggested fields:

- id UUID primary key
- product_id UUID foreign key
- image_id UUID foreign key
- sort_order integer
- created_at timestamp

## product_field_confidences

Stores AI confidence values attached to saved products.

Suggested fields:

- id UUID primary key
- product_id UUID foreign key
- ai_analysis_id UUID foreign key
- field_name text
- confidence_percentage text
- created_at timestamp

Alternative:

Store a JSONB confidence map directly on products if simpler for MVP.

## product_chat_messages

Stores admin chat history with the VLM.

Suggested fields:

- id UUID primary key
- product_id UUID foreign key nullable
- image_id UUID foreign key nullable
- role text
- message text
- model text nullable
- metadata jsonb nullable
- created_at timestamp

Roles:

- admin
- assistant
- system

## Suggested Indexes

- products.status
- products.created_at
- products.updated_at
- ai_analyses.image_id
- product_images.created_at
- product_chat_messages.product_id
- product_chat_messages.image_id

## Schema Decision Requirements

Before implementing migrations, the agent should document:

- chosen tables
- chosen JSONB fields
- why confidence is stored as rows or JSON
- how raw AI output differs from final admin-approved product data
- how product previews use unsaved frontend state
