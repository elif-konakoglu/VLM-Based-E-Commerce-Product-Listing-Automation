import apiClient from "./client";
import type { Product, ProductListResponse } from "@/types";

export async function listProducts(params?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<ProductListResponse> {
  const { data } = await apiClient.get("/products", { params });
  return data;
}

export async function getProduct(id: string): Promise<Product> {
  const { data } = await apiClient.get(`/products/${id}`);
  return data;
}

export async function createProduct(body: Record<string, unknown>): Promise<Product> {
  const { data } = await apiClient.post("/products", body);
  return data;
}

export async function updateProduct(
  id: string,
  body: Record<string, unknown>
): Promise<Product> {
  const { data } = await apiClient.patch(`/products/${id}`, body);
  return data;
}

export async function publishProduct(id: string): Promise<Product> {
  const { data } = await apiClient.post(`/products/${id}/publish`);
  return data;
}

export async function draftProduct(id: string): Promise<Product> {
  const { data } = await apiClient.post(`/products/${id}/draft`);
  return data;
}

export async function archiveProduct(id: string): Promise<Product> {
  const { data } = await apiClient.delete(`/products/${id}`);
  return data;
}
