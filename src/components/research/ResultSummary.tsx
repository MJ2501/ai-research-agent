"use client";
import { Result } from "@/lib/types/research";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeywordChips } from "@/components/research/KeywordChips";
import { ArticleCard } from "@/components/research/ArticleCard";

export function ResultSummary({ result }: { result: Result }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-lg">Summary</h3>
        <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
          {result.summary}
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-lg">Top Keywords</h3>
        <KeywordChips keywords={result.topKeywords} />
      </div>

      <div className="grid gap-3">
        <h3 className="font-semibold text-lg">Top Articles</h3>
        {result.topArticles?.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {result.topArticles.map((a, idx) => (
              <ArticleCard key={`${a.url}-${idx}`} article={a} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No articles.</p>
        )}
      </div>
    </div>
  );
}
