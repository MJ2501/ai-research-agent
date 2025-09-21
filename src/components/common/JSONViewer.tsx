"use client";
export function JSONViewer({ value }: { value: unknown }) {
  return (
    <pre className="overflow-x-auto rounded bg-muted p-3 text-xs leading-relaxed">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}
