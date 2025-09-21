"use client";
import { Badge } from "@/components/ui/badge";
import { Status } from "@/lib/types/research";

export function TaskStatusBadge({ status }: { status: Status }) {
  const style: Record<
    Status,
    {
      variant?: "default" | "secondary" | "outline";
      className?: string;
      label: string;
    }
  > = {
    PENDING: { variant: "secondary", className: "", label: "Pending" },
    RUNNING: { variant: "default", className: "", label: "Running" },
    COMPLETED: {
      variant: "outline",
      className: "border-green-500 text-green-600",
      label: "Completed",
    },
    FAILED: {
      variant: "outline",
      className: "border-red-500 text-red-600",
      label: "Failed",
    },
  };
  const cfg = style[status];
  return (
    <Badge variant={cfg.variant} className={cfg.className}>
      {cfg.label}
    </Badge>
  );
}
