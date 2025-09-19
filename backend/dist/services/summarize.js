"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeTextLLM = summarizeTextLLM;
exports.summarizeNaive = summarizeNaive;
const axios_1 = __importDefault(require("axios"));
async function summarizeTextLLM(text, apiKey) {
    if (!apiKey)
        return null;
    // Minimal OpenAI-compatible example (kept generic; adjust to your provider)
    try {
        const resp = await axios_1.default.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "Summarize the following text in 3-4 sentences, neutral tone.",
                },
                { role: "user", content: text.slice(0, 6000) },
            ],
            temperature: 0.2,
        }, { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 20000 });
        const content = resp.data?.choices?.[0]?.message?.content?.trim();
        return content || null;
    }
    catch {
        return null;
    }
}
function summarizeNaive(text, maxSentences = 3) {
    const sentences = text
        .replace(/\s+/g, " ")
        .split(/(?<=[.?!])\s+/)
        .filter(Boolean);
    return sentences.slice(0, maxSentences).join(" ");
}
