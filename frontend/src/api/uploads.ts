import apiClient from "./client";
import type { ProductImage } from "@/types";

export async function uploadImage(file: File): Promise<ProductImage> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post("/uploads/images", formData);
  return data;
}
