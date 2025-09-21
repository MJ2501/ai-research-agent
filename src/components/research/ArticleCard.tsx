"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Article } from "@/lib/types/research";
import { ExternalLink } from "lucide-react";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base line-clamp-2">
          {article.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {article.excerpt && <p className="line-clamp-3">{article.excerpt}</p>}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs">
            {article.source ?? new URL(article.url).hostname}
          </span>
          <a
            href={article.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs hover:underline"
          >
            Open <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
