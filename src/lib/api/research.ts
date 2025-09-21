import { http } from "@/lib/api/client";
import { Paginated, Task } from "@/lib/types/research";

const API_BASE_URL = "/api";

export async function listResearch(params?: {
  search?: string;
  cursor?: string;
  pageSize?: number;
  limit?: number;
}): Promise<Paginated<Task>> {
  const url = new URL(
    `${API_BASE_URL}/research`,
    typeof window === "undefined" ? "http://localhost" : window.location.origin
  );
  if (params?.search) url.searchParams.set("search", params.search);
  if (params?.cursor) url.searchParams.set("cursor", params.cursor);
  if (params?.pageSize)
    url.searchParams.set("pageSize", String(params.pageSize));
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  return http<Paginated<Task>>(url.toString());
}

export async function getResearch(id: string): Promise<Task> {
  return http<Task>(`${API_BASE_URL}/research/${id}`);
}

export async function submitResearch(payload: {
  topic: string;
  notes?: string;
}): Promise<{ id: string }> {
  return http<{ id: string }>(`${API_BASE_URL}/research`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
