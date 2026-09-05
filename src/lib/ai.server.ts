const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.6-flash";

type Msg = { role: "system" | "user"; content: string };

export async function callAi(messages: Msg[]): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured for this project.");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: MODEL, messages }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429) throw new Error("AI is busy right now — try again in a moment.");
    if (res.status === 402)
      throw new Error("AI credits are exhausted. Add credits to keep generating.");
    if (res.status === 403) throw new Error("AI access is blocked for this workspace.");
    throw new Error(`AI request failed (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("The AI returned an empty response. Try again.");
  return text;
}

export async function callAiJson<T>(messages: Msg[]): Promise<T> {
  const raw = await callAi(messages);
  const cleaned = raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = cleaned.search(/[[{]/);
  const end = Math.max(cleaned.lastIndexOf("]"), cleaned.lastIndexOf("}"));
  if (start === -1 || end === -1) throw new Error("The AI response could not be read. Try again.");
  return JSON.parse(cleaned.slice(start, end + 1)) as T;
}

/** Lightweight keyword retrieval over the document's chunks (the R in RAG). */
export function retrieveChunks(
  chunks: { chunk_index: number; content: string }[],
  question: string,
  take = 6,
): string {
  const terms = question
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 3);

  if (!terms.length) return chunks.slice(0, take).map((c) => c.content).join("\n\n---\n\n");

  const scored = chunks.map((chunk) => {
    const text = chunk.content.toLowerCase();
    let score = 0;
    for (const term of terms) {
      const hits = text.split(term).length - 1;
      score += hits;
    }
    return { chunk, score };
  });

  const best = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, take)
    .sort((a, b) => a.chunk.chunk_index - b.chunk.chunk_index)
    .map((s) => s.chunk.content);

  const picked = best.length ? best : chunks.slice(0, take).map((c) => c.content);
  return picked.join("\n\n---\n\n");
}

export function joinChunks(
  chunks: { content: string }[],
  maxChars = 24000,
): string {
  let out = "";
  for (const chunk of chunks) {
    if (out.length + chunk.content.length > maxChars) break;
    out += chunk.content + "\n\n";
  }
  return out.trim() || chunks[0]?.content.slice(0, maxChars) || "";
}
