/* eslint-disable @typescript-eslint/no-explicit-any */
import { listResearch } from "@/lib/api/research";

export default async function Page() {
  const { tasks } = await listResearch();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Research Tasks</h1>
      <ul className="divide-y border rounded">
        {tasks.map((t: any) => (
          <li key={t.id} className="p-3 hover:bg-gray-50">
            <a
              href={`/research/${t.id}`}
              className="flex items-center justify-between"
            >
              <span>{t.topic}</span>
              <span className="text-xs rounded px-2 py-1 border">
                {t.status}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
