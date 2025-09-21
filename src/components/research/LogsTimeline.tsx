"use client";
import { LogEntry } from "@/lib/types/research";
import { cn } from "@/lib/utils/format";

export function LogsTimeline({ logs }: { logs: LogEntry[] }) {
  if (!logs?.length)
    return <p className="text-sm text-muted-foreground">No logs yet.</p>;
  return (
    <ol className="relative ml-3 border-l pl-6">
      {logs
        .sort(
          (a, b) =>
            a.step - b.step ||
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
        .map((log) => (
          <li key={`${log.step}-${log.id}`} className="mb-6">
            <span
              className={cn(
                "absolute -left-[9px] mt-1 h-3 w-3 rounded-full border",
                log.level === "error"
                  ? "bg-red-500 border-red-500"
                  : log.level === "warn"
                  ? "bg-yellow-500 border-yellow-500"
                  : "bg-primary border-primary"
              )}
            />
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Step {log.step}:</span>
              <span>{log.title}</span>
              <span className="text-xs text-muted-foreground">
                · {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
              {log.message}
            </p>
            {log.meta && (
              <details className="mt-2 text-xs">
                <summary className="cursor-pointer">Details</summary>
                <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-xs">
                  {JSON.stringify(log.meta, null, 2)}
                </pre>
              </details>
            )}
          </li>
        ))}
    </ol>
  );
}
