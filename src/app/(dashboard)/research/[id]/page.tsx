"use client";
import { useParams } from "next/navigation";
import { useResearchDetail } from "@/lib/hooks/useResearchDetail";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { TaskStatusBadge } from "../../../../components/research/TaskStatusBadge";
import { LogsTimeline } from "../../../../components/research/LogsTimeline";
import { ResultSummary } from "../../../../components/research/ResultSummary";
import { JSONViewer } from "../../../../components/common/JSONViewer";
import { Button } from "../../../../components/ui/button";
import Link from "next/link";

export default function TaskDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data, isLoading, isError, refetch } = useResearchDetail(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Failed to load task.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {data.topic}
          </h1>
          <p className="text-sm text-muted-foreground">
            Created {new Date(data.createdAt).toLocaleString()} · Updated{" "}
            {new Date(data.updatedAt).toLocaleString()}
          </p>
        </div>
        <TaskStatusBadge status={data.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workflow Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <LogsTimeline logs={data.logs} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Structured Result</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/(dashboard)/research">Back to list</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.result ? (
              <ResultSummary result={data.result} />
            ) : (
              <p className="text-sm text-muted-foreground">
                No result yet. If the task is still running, this will populate
                when complete.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Raw JSON</CardTitle>
        </CardHeader>
        <CardContent>
          <JSONViewer value={data} />
        </CardContent>
      </Card>
    </div>
  );
}
