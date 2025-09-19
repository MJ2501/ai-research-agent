"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWikipedia = fetchWikipedia;
exports.fetchHackerNews = fetchHackerNews;
exports.gatherArticles = gatherArticles;
const axios_1 = __importDefault(require("axios"));
async function fetchWikipedia(topic) {
    // Search top pages
    const search = await axios_1.default.get("https://en.wikipedia.org/w/api.php", {
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
    const pages = search.data?.query?.search?.map((s) => ({
        title: s.title,
        pageid: s.pageid,
    })) ?? [];
    // Fetch summaries via REST summary endpoint (more readable)
    const items = [];
    for (const p of pages) {
        try {
            const summary = await axios_1.default.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(p.title)}`, { timeout: 10000 });
            items.push({
                title: summary.data.title,
                url: summary.data.content_urls?.desktop?.page ??
                    `https://en.wikipedia.org/?curid=${p.pageid}`,
                source: "wikipedia",
                summary: summary.data.extract,
            });
        }
        catch {
            // continue best-effort
        }
    }
    return items;
}
async function fetchHackerNews(topic) {
    const res = await axios_1.default.get("https://hn.algolia.com/api/v1/search", {
        params: { query: topic, tags: "story", hitsPerPage: 5 },
        timeout: 10000,
    });
    const items = (res.data?.hits ?? [])
        .filter((h) => h.title && h.url) // stories with URLs
        .map((h) => ({
        title: h.title,
        url: h.url,
        source: "hackernews",
        publishedAt: h.created_at,
    }));
    return items;
}
async function gatherArticles(topic) {
    const [wiki, hn] = await Promise.allSettled([
        fetchWikipedia(topic),
        fetchHackerNews(topic),
    ]);
    const list = [];
    if (wiki.status === "fulfilled")
        list.push(...wiki.value);
    if (hn.status === "fulfilled")
        list.push(...hn.value);
    // de-dup by URL/title
    const seen = new Set();
    const dedup = list.filter((a) => {
        const key = (a.url || a.title).toLowerCase();
        if (seen.has(key))
            return false;
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
