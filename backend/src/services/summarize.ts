import axios from "axios";

export async function summarizeTextLLM(
  text: string,
  apiKey?: string
): Promise<string | null> {
  if (!apiKey) return null;
  // Minimal OpenAI-compatible example (kept generic; adjust to your provider)
  try {
    const resp = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Summarize the following text in 3-4 sentences, neutral tone.",
          },
          { role: "user", content: text.slice(0, 6000) },
        ],
        temperature: 0.2,
      },
      { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 20000 }
    );
    const content = resp.data?.choices?.[0]?.message?.content?.trim();
    return content || null;
  } catch {
    return null;
  }
}

export function summarizeNaive(text: string, maxSentences = 3): string {
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.?!])\s+/)
    .filter(Boolean);
  return sentences.slice(0, maxSentences).join(" ");
}
