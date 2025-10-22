"use client";
import { useState } from "react";
import { submitResearch } from "@/lib/api/research";
import { useRouter } from "next/navigation";

export default function ResearchForm() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const r = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { id } = await submitResearch(topic);
      r.push(`/research/${id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="e.g. Quantum dots in displays"
        className="border px-3 py-2 rounded w-full"
      />
      <button
        disabled={!topic || loading}
        className="px-4 py-2 rounded bg-black text-white"
      >
        {loading ? "Submitting…" : "Research"}
      </button>
    </form>
  );
}
