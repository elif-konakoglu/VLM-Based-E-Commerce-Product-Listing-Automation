import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ImageUploadResponse(BaseModel):
    id: uuid.UUID
    filename: str
    original_filename: str
    url: str
    content_type: str
    size_bytes: int
    width: Optional[int] = None
    height: Optional[int] = None
    created_at: datetime


class AIAnalyzeRequest(BaseModel):
    image_id: uuid.UUID


class AIRegenerateFieldRequest(BaseModel):
    image_id: uuid.UUID
    field_name: str


class AIRegenerateFieldResponse(BaseModel):
    field_name: str
    value: str | list | None = None
    confidence_percentage: str = "0%"


class AISuggestionField(BaseModel):
    value: str | list | None = None
    confidence_percentage: str = "0%"


class AISuggestions(BaseModel):
    main_category: AISuggestionField = Field(default_factory=AISuggestionField)
    target_audience: AISuggestionField = Field(default_factory=AISuggestionField)
    subcategory: AISuggestionField = Field(default_factory=AISuggestionField)
    tags: AISuggestionField = Field(default_factory=AISuggestionField)
    color: AISuggestionField = Field(default_factory=AISuggestionField)
    texture: AISuggestionField = Field(default_factory=AISuggestionField)
    pattern: AISuggestionField = Field(default_factory=AISuggestionField)
    length_type: AISuggestionField = Field(default_factory=AISuggestionField)
    fit_type: AISuggestionField = Field(default_factory=AISuggestionField)
    style: AISuggestionField = Field(default_factory=AISuggestionField)
    material_guess: AISuggestionField = Field(default_factory=AISuggestionField)
    short_marketing_title: AISuggestionField = Field(default_factory=AISuggestionField)
    marketing_description: AISuggestionField = Field(default_factory=AISuggestionField)
    bullet_points: AISuggestionField = Field(default_factory=AISuggestionField)


class AIAnalysisResponse(BaseModel):
    id: uuid.UUID
    image_id: uuid.UUID
    model: str
    prompt_version: str
    status: str
    suggestions: Optional[dict] = None
    latency_ms: Optional[int] = None
    created_at: datetime


class ChatRequest(BaseModel):
    image_id: uuid.UUID
    product_id: Optional[uuid.UUID] = None
    message: str = Field(min_length=1, max_length=2000)
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    id: uuid.UUID
    reply: str
    created_at: datetime


class ChatMessageOut(BaseModel):
    id: uuid.UUID
    role: str
    message: str
    created_at: datetime


class ChatHistoryResponse(BaseModel):
    items: list[ChatMessageOut]
    total: int


class ProductCreate(BaseModel):
    status: str = "draft"
    main_image_id: Optional[uuid.UUID] = None
    image_ids: list[uuid.UUID] = Field(default_factory=list)
    ai_analysis_id: Optional[uuid.UUID] = None
    main_category: Optional[str] = None
    target_audience: Optional[str] = None
    subcategory: Optional[str] = None
    tags: list[str] = Field(default_factory=list)
    color: list[str] = Field(default_factory=list)
    texture: Optional[str] = None
    pattern: Optional[str] = None
    length_type: Optional[str] = None
    fit_type: Optional[str] = None
    style: Optional[str] = None
    material_guess: Optional[str] = None
    short_marketing_title: Optional[str] = None
    marketing_description: Optional[str] = None
    bullet_points: list[str] = Field(default_factory=list)
    confidence_snapshot: Optional[dict] = None


class ProductUpdate(BaseModel):
    status: Optional[str] = None
    main_image_id: Optional[uuid.UUID] = None
    image_ids: Optional[list[uuid.UUID]] = None
    main_category: Optional[str] = None
    target_audience: Optional[str] = None
    subcategory: Optional[str] = None
    tags: Optional[list[str]] = None
    color: Optional[list[str]] = None
    texture: Optional[str] = None
    pattern: Optional[str] = None
    length_type: Optional[str] = None
    fit_type: Optional[str] = None
    style: Optional[str] = None
    material_guess: Optional[str] = None
    short_marketing_title: Optional[str] = None
    marketing_description: Optional[str] = None
    bullet_points: Optional[list[str]] = None
    confidence_snapshot: Optional[dict] = None


class ProductOut(BaseModel):
    id: uuid.UUID
    status: str
    main_image_id: Optional[uuid.UUID] = None
    main_image_url: Optional[str] = None
    ai_analysis_id: Optional[uuid.UUID] = None
    main_category: Optional[str] = None
    target_audience: Optional[str] = None
    subcategory: Optional[str] = None
    tags: list[str] = Field(default_factory=list)
    color: list[str] = Field(default_factory=list)
    texture: Optional[str] = None
    pattern: Optional[str] = None
    length_type: Optional[str] = None
    fit_type: Optional[str] = None
    style: Optional[str] = None
    material_guess: Optional[str] = None
    short_marketing_title: Optional[str] = None
    marketing_description: Optional[str] = None
    bullet_points: list[str] = Field(default_factory=list)
    confidence_snapshot: Optional[dict] = None
    image_ids: list[uuid.UUID] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    archived_at: Optional[datetime] = None


class ProductListItem(BaseModel):
    id: uuid.UUID
    status: str
    short_marketing_title: Optional[str] = None
    main_category: Optional[str] = None
    main_image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ProductListResponse(BaseModel):
    items: list[ProductListItem]
    total: int
    limit: int
    offset: int


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: dict = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    error: ErrorDetail
