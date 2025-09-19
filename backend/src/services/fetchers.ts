import axios from "axios";

export type FetchedArticle = {
  title: string;
  url: string;
  source: string; // "wikipedia" | "hackernews"
  publishedAt?: string;
  summary?: string;
};

export async function fetchWikipedia(topic: string): Promise<FetchedArticle[]> {
  // Search top pages
  const search = await axios.get("https://en.wikipedia.org/w/api.php", {
    params: {
      action: "query",
      list: "search",
      srsearch: topic,
      srlimit: 5,
      format: "json",
      origin: "*",
    },
    timeout: 10000,
  });
  const pages: { title: string; pageid: number }[] =
    search.data?.query?.search?.map((s: any) => ({
      title: s.title,
      pageid: s.pageid,
    })) ?? [];

  // Fetch summaries via REST summary endpoint (more readable)
  const items: FetchedArticle[] = [];
  for (const p of pages) {
    try {
      const summary = await axios.get(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          p.title
        )}`,
        { timeout: 10000 }
      );
      items.push({
        title: summary.data.title,
        url:
          summary.data.content_urls?.desktop?.page ??
          `https://en.wikipedia.org/?curid=${p.pageid}`,
        source: "wikipedia",
        summary: summary.data.extract,
      });
    } catch {
      // continue best-effort
    }
  }
  return items;
}

export async function fetchHackerNews(
  topic: string
): Promise<FetchedArticle[]> {
  const res = await axios.get("https://hn.algolia.com/api/v1/search", {
    params: { query: topic, tags: "story", hitsPerPage: 5 },
    timeout: 10000,
  });

  const items: FetchedArticle[] = (res.data?.hits ?? [])
    .filter((h: any) => h.title && h.url) // stories with URLs
    .map((h: any) => ({
      title: h.title as string,
      url: h.url as string,
      source: "hackernews",
      publishedAt: h.created_at,
    }));

  return items;
}

export async function gatherArticles(topic: string): Promise<FetchedArticle[]> {
  const [wiki, hn] = await Promise.allSettled([
    fetchWikipedia(topic),
    fetchHackerNews(topic),
  ]);
  const list: FetchedArticle[] = [];
  if (wiki.status === "fulfilled") list.push(...wiki.value);
  if (hn.status === "fulfilled") list.push(...hn.value);

  // de-dup by URL/title
  const seen = new Set<string>();
  const dedup = list.filter((a) => {
    const key = (a.url || a.title).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // pick top 5 (Wikipedia first for better summaries)
  const prioritized = [
    ...dedup.filter((d) => d.source === "wikipedia"),
    ...dedup.filter((d) => d.source !== "wikipedia"),
  ];
  return prioritized.slice(0, 5);
}
