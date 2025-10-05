/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/db";
import { Article } from "@/lib/types/research";

async function log(
  taskId: string,
  step: number,
  label: string,
  message: string,
  payload?: any
) {
  await prisma.researchLog.create({
    data: { taskId, step, label, message, payload },
  });
}

async function fetchWikipedia(topic: string): Promise<Article[]> {
  const q = encodeURIComponent(topic);
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srsearch=${q}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  const json = await res.json();
  const items = (json?.query?.search ?? []) as any[];
  return items.slice(0, 5).map((it) => ({
    title: it.title,
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(it.title)}`,
    source: "Wikipedia",
    snippet: it.snippet?.replace(/<[^>]+>/g, "") ?? "",
  }));
}

async function fetchHackerNews(topic: string): Promise<Article[]> {
  const q = encodeURIComponent(topic);
  const url = `https://hn.algolia.com/api/v1/search?query=${q}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  const json = await res.json();
  const hits = (json?.hits ?? []) as any[];
  return hits.slice(0, 5).map((h) => ({
    title: h.title ?? h.story_title ?? "HN Story",
    url:
      h.url ??
      h.story_url ??
      `https://news.ycombinator.com/item?id=${h.objectID}`,
    source: "HackerNews",
    snippet: h._highlightResult?.title?.value?.replace(/<[^>]+>/g, "") ?? "",
  }));
}

function extractKeywords(texts: string[], topN = 10): string[] {
  const freq = new Map<string, number>();
  const stop = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "to",
    "of",
    "in",
    "on",
    "for",
    "with",
    "is",
    "are",
    "was",
    "were",
    "by",
    "from",
    "as",
    "at",
    "that",
    "this",
    "it",
    "be",
    "has",
    "have",
    "had",
    "not",
  ]);
  for (const t of texts) {
    for (const raw of t.toLowerCase().match(/[a-z0-9-]{3,}/g) ?? []) {
      if (stop.has(raw)) continue;
      freq.set(raw, (freq.get(raw) ?? 0) + 1);
    }
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([k]) => k);
}

export async function runWorkflow(taskId: string) {
  const task = await prisma.researchTask.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Task not found");
  const topic = task.topic;

  await log(taskId, 2, "gather:start", `Fetching articles for “${topic}”…`);
  const [wiki, hn] = await Promise.all([
    fetchWikipedia(topic),
    fetchHackerNews(topic),
  ]);
  const all = [...wiki, ...hn];
  await log(taskId, 2, "gather:done", `Fetched ${all.length} articles`, {
    counts: { wiki: wiki.length, hn: hn.length },
  });

  const top5 = all.slice(0, 5);
  const summaryByRule = top5.map((a) => ({
    ...a,
    snippet: a.snippet || `Article about ${topic} from ${a.source}`,
  }));

  const keywords = extractKeywords(
    summaryByRule.map((a) => `${a.title} ${a.snippet}`),
    10
  );
  await log(taskId, 3, "process:done", "Computed summaries and keywords", {
    keywords,
  });

  await prisma.researchTask.update({
    where: { id: taskId },
    data: {
      articles: summaryByRule as any,
      summary: { topic, count: summaryByRule.length },
    },
  });
}
