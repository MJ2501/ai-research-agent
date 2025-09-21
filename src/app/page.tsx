"use client";
import Link from "next/link";
import { ResearchForm } from "..//components/research/ResearchForm";
import { useResearchList } from "../lib/hooks/useResearchList";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { TaskStatusBadge } from "../components/research/TaskStatusBadge";
import { Button } from "../components/ui/button";

export default function LandingPage() {
  const { data, isLoading, isError, refetch } = useResearchList({ limit: 5 });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Quick Submit</CardTitle>
        </CardHeader>
        <CardContent>
          <ResearchForm compact />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Research</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/(dashboard)/research">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-muted animate-pulse rounded" />
              ))}
            </div>
          )}
          {isError && (
            <div className="text-sm text-destructive">
              Failed to load.{" "}
              <button className="underline" onClick={() => refetch()}>
                Retry
              </button>
            </div>
          )}
          {!isLoading && !isError && (
            <ul className="space-y-2">
              {data?.items?.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between rounded border p-3"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/(dashboard)/research/${t.id}`}
                      className="font-medium hover:underline line-clamp-1"
                    >
                      {t.topic}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {new Date(t.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <TaskStatusBadge status={t.status} />
                </li>
              ))}
              {data?.items?.length === 0 && (
                <p className="text-sm text-muted-foreground">No tasks yet.</p>
              )}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
