"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractKeywords = extractKeywords;
const STOP = new Set([
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "he",
    "in",
    "is",
    "it",
    "its",
    "of",
    "on",
    "that",
    "the",
    "to",
    "was",
    "were",
    "will",
    "with",
    "this",
    "these",
    "those",
    "their",
    "them",
    "they",
    "we",
    "you",
    "your",
    "i",
    "or",
    "if",
    "but",
    "not",
    "about",
    "into",
    "over",
    "after",
    "before",
    "than",
    "then",
    "so",
    "such",
    "also",
    "can",
    "may",
    "might",
    "one",
    "two",
    "three",
    "our",
    "more",
    "most",
    "other",
    "some",
    "any",
    "much",
    "many",
    "new",
    "use",
    "used",
    "using",
]);
function extractKeywords(text, topN = 15) {
    const counts = new Map();
    const words = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
    for (const w of words) {
        if (STOP.has(w) || w.length < 3)
            continue;
        counts.set(w, (counts.get(w) ?? 0) + 1);
    }
    return [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .map(([w]) => w);
}
