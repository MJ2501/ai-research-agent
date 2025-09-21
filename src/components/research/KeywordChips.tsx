"use client";
import { Badge } from "@/components/ui/badge";

export function KeywordChips({ keywords }: { keywords: string[] }) {
  if (!keywords?.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {keywords.map((k) => (
        <Badge key={k} variant="secondary" className="rounded-full">
          {k}
        </Badge>
      ))}
    </div>
  );
}
