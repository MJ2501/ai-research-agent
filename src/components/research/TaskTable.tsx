"use client";
import Link from "next/link";
import { Task } from "@/lib/types/research";
import { TaskStatusBadge } from "@/components/research/TaskStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TaskTable({
  tasks,
  isLoading,
  isError,
}: {
  tasks: Task[];
  isLoading?: boolean;
  isError?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }
  if (isError) {
    return <p className="text-destructive">Failed to load tasks.</p>;
  }
  if (!tasks?.length) {
    return <p className="text-sm text-muted-foreground">No tasks found.</p>;
  }
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Topic</TableHead>
            <TableHead className="hidden md:table-cell">Created</TableHead>
            <TableHead className="hidden md:table-cell">Updated</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="max-w-[480px]">
                <Link
                  href={`/(dashboard)/research/${t.id}`}
                  className="font-medium hover:underline line-clamp-1"
                >
                  {t.topic}
                </Link>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {new Date(t.createdAt).toLocaleString()}
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {new Date(t.updatedAt).toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                <TaskStatusBadge status={t.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
