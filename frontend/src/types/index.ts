export interface ProductImage {
  id: string;
  filename: string;
  original_filename: string;
  url: string;
  content_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  created_at: string;
}

export interface AISuggestionField {
  value: string | string[] | null;
  confidence_percentage: string;
}

export interface AISuggestions {
  main_category: AISuggestionField;
  target_audience: AISuggestionField;
  subcategory: AISuggestionField;
  tags: AISuggestionField;
  color: AISuggestionField;
  texture: AISuggestionField;
  pattern: AISuggestionField;
  length_type: AISuggestionField;
  fit_type: AISuggestionField;
  style: AISuggestionField;
  material_guess: AISuggestionField;
  short_marketing_title: AISuggestionField;
  marketing_description: AISuggestionField;
  bullet_points: AISuggestionField;
}

export interface AIAnalysis {
  id: string;
  image_id: string;
  model: string;
  prompt_version: string;
  status: string;
  suggestions: AISuggestions | null;
  latency_ms: number | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: "admin" | "assistant";
  message: string;
  created_at: string;
}

export interface Product {
  id: string;
  status: string;
  main_image_id: string | null;
  main_image_url: string | null;
  ai_analysis_id: string | null;
  main_category: string | null;
  target_audience: string | null;
  subcategory: string | null;
  tags: string[];
  color: string[];
  texture: string | null;
  pattern: string | null;
  length_type: string | null;
  fit_type: string | null;
  style: string | null;
  material_guess: string | null;
  short_marketing_title: string | null;
  marketing_description: string | null;
  bullet_points: string[];
  confidence_snapshot: Record<string, AISuggestionField> | null;
  image_ids: string[];
  created_at: string;
  updated_at: string;
  published_at: string | null;
  archived_at: string | null;
}

export interface ProductListItem {
  id: string;
  status: string;
  short_marketing_title: string | null;
  main_category: string | null;
  main_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductListResponse {
  items: ProductListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface ApiError {
  code: string;
  message: string;
  details: Record<string, unknown>;
}
