"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitResearch } from "@/lib/api/research";

export function useSubmitResearch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submitResearch,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["research", "list"] });
    },
  });
}
