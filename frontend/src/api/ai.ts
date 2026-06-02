import apiClient from "./client";
import type { AIAnalysis, ChatMessage } from "@/types";

export async function analyzeImage(imageId: string): Promise<AIAnalysis> {
  const { data } = await apiClient.post("/ai/analyze", { image_id: imageId });
  return data;
}

export async function regenerateField(
  imageId: string,
  fieldName: string
): Promise<{ field_name: string; value: string | string[] | null; confidence_percentage: string }> {
  const { data } = await apiClient.post("/ai/regenerate-field", {
    image_id: imageId,
    field_name: fieldName,
  });
  return data;
}

export async function sendChatMessage(params: {
  image_id: string;
  message: string;
  product_id?: string;
  context?: Record<string, unknown>;
}): Promise<{ id: string; reply: string; created_at: string }> {
  const { data } = await apiClient.post("/ai/chat", params);
  return data;
}

export async function getChatHistory(
  imageId: string,
  productId?: string
): Promise<{ items: ChatMessage[]; total: number }> {
  const params: Record<string, string> = { image_id: imageId };
  if (productId) params.product_id = productId;
  const { data } = await apiClient.get("/ai/chat/history", { params });
  return data;
}
