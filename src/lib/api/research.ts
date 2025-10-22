/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "./client";

export function submitResearch(topic: string) {
  return api<{ id: string }>(`/api/research`, {
    method: "POST",
    body: JSON.stringify({ topic }),
  });
}

export function listResearch() {
  return api<{ tasks: any[] }>(`/api/research`);
}

export function getResearch(id: string) {
  return api<{ task: any }>(`/api/research/${id}`);
}
