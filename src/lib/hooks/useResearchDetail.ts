"use client";
import { useQuery } from "@tanstack/react-query";
import { getResearch } from "@/lib/api/research";

export function useResearchDetail(id?: string) {
  return useQuery({
    queryKey: ["research", "detail", id],
    queryFn: () => getResearch(id as string),
    enabled: Boolean(id),
  });
}
