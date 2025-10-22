/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { getResearch } from "@/lib/api/research";
import { useEventSource } from "@/lib/hooks/useEventSource";

export default function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const [task, setTask] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    getResearch(id).then(({ task }) => {
      setTask(task);
      setLogs(task.logs);
    });
  }, [id]);

  useEventSource(`/api/research/events/${id}`, (ev) => {
    try {
      const l = JSON.parse(ev.data);
      setLogs((prev) =>
        prev.find((x) => x.id === l.id) ? prev : [...prev, l]
      );
    } catch {}
  });

  const articles = (task?.articles ?? []) as any[];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <section className="lg:col-span-2 space-y-4">
        <h1 className="text-xl font-semibold">{task?.topic ?? "Loading…"}</h1>
        <div className="space-y-3">
          {articles.map((a) => (
            <a
              key={a.url}
              href={a.url}
              target="_blank"
              className="block border rounded p-3 hover:bg-gray-50"
            >
              <div className="text-sm text-gray-500">{a.source}</div>
              <div className="font-medium">{a.title}</div>
              <div className="text-sm">{a.snippet}</div>
            </a>
          ))}
        </div>
      </section>
      <aside className="space-y-2 max-h-[70vh] overflow-auto border rounded p-3">
        <h2 className="font-medium">Logs</h2>
        <ul className="space-y-2 text-sm">
          {logs.map((l) => (
            <li key={l.id} className="border rounded p-2">
              <div className="text-gray-500">
                Step {l.step} — {l.label}
              </div>
              <div>{l.message}</div>
            </li>
          ))}
        </ul>
        {!!task?.keywords?.length && (
          <div className="pt-4">
            <h3 className="font-medium mb-2">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {task.keywords.map((k: string) => (
                <span key={k} className="text-xs px-2 py-1 border rounded">
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
