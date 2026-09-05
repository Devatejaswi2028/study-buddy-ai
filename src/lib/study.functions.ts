import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const docInput = z.object({ documentId: z.string().uuid() });

async function loadChunks(
  supabase: any,
  documentId: string,
): Promise<{ chunk_index: number; content: string }[]> {
  const { data, error } = await supabase
    .from("document_chunks")
    .select("chunk_index, content")
    .eq("document_id", documentId)
    .order("chunk_index", { ascending: true });
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("This document has no extracted text yet.");
  return data;
}

async function saveOutput(
  supabase: any,
  userId: string,
  documentId: string,
  kind: string,
  params: Record<string, unknown>,
  content: string,
) {
  await supabase
    .from("study_outputs")
    .insert({ document_id: documentId, user_id: userId, kind, params, content });
}

const SYSTEM =
  "You are AI StudyMate, a study assistant for Indian college students. You answer ONLY from the study material given to you. If the material does not cover something, say so plainly. Write clear, exam-friendly language.";

/* ---------------- Phase 2: summary, revision notes, explain simply ---------------- */

export const generateText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    docInput
      .extend({
        kind: z.enum(["summary", "revision", "explain"]),
        topic: z.string().max(200).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { callAi, joinChunks } = await import("./ai.server");
    const chunks = await loadChunks(context.supabase, data.documentId);
    const material = joinChunks(chunks);

    const prompts: Record<typeof data.kind, string> = {
      summary:
        "Write a concise smart summary of the material below. Use short section headings and tight bullet points. Keep it under 500 words.",
      revision:
        "Write last-minute revision notes from the material below: the most important points as bullets, then a 'Keywords' list of key terms with a 5-10 word meaning each.",
      explain: `Explain the material below in very simple language, as if to a first-year student. Use short sentences, everyday analogies and no jargon without defining it.${
        data.topic ? ` Focus specifically on: ${data.topic}.` : ""
      }`,
    };

    const content = await callAi([
      { role: "system", content: SYSTEM },
      { role: "user", content: `${prompts[data.kind]}\n\nSTUDY MATERIAL:\n${material}` },
    ]);

    await saveOutput(
      context.supabase,
      context.userId,
      data.documentId,
      data.kind,
      { topic: data.topic ?? null },
      content,
    );
    return { content };
  });

/* ---------------- Phase 3: RAG-based Ask AI ---------------- */

export const askDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    docInput.extend({ question: z.string().min(2).max(1000) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { callAi, retrieveChunks } = await import("./ai.server");
    const chunks = await loadChunks(context.supabase, data.documentId);
    const passages = retrieveChunks(chunks, data.question);

    const answer = await callAi([
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Answer the student's question using only the retrieved passages from their PDF.\n\nRETRIEVED PASSAGES:\n${passages}\n\nQUESTION: ${data.question}`,
      },
    ]);

    return { answer };
  });

/* ---------------- Phase 4: MCQs and mark-wise exam answers ---------------- */

export type Mcq = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export const generateMcqs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => docInput.extend({ count: z.number().min(3).max(15) }).parse(data))
  .handler(async ({ data, context }) => {
    const { callAiJson, joinChunks } = await import("./ai.server");
    const chunks = await loadChunks(context.supabase, data.documentId);
    const material = joinChunks(chunks, 18000);

    const mcqs = await callAiJson<Mcq[]>([
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Create exactly ${data.count} multiple-choice questions from the material below. Return ONLY a JSON array, each item: {"question": string, "options": [4 strings], "answerIndex": 0-3, "explanation": string}. No markdown fences.\n\nSTUDY MATERIAL:\n${material}`,
      },
    ]);

    await saveOutput(
      context.supabase,
      context.userId,
      data.documentId,
      "mcq",
      { count: data.count },
      JSON.stringify(mcqs),
    );
    return { mcqs };
  });

export const generateExamAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    docInput
      .extend({
        subject: z.string().min(1).max(120),
        exam: z.enum(["Mid-term", "End-term", "Internal", "Practice"]),
        marks: z.enum(["2", "5", "6", "10"]),
        question: z.string().min(3).max(500),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { callAi, retrieveChunks } = await import("./ai.server");
    const chunks = await loadChunks(context.supabase, data.documentId);
    const passages = retrieveChunks(chunks, `${data.subject} ${data.question}`, 8);

    const lengths: Record<string, string> = {
      "2": "about 60-90 words",
      "5": "about 180-250 words",
      "6": "about 220-300 words",
      "10": "about 400-550 words",
    };

    const content = await callAi([
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Write an exam-ready answer for a ${data.marks}-mark ${data.exam} question in ${data.subject}, ${lengths[data.marks]}.

Use exactly this structure with these markdown headings:
## Definition
## Explanation
## Key Points
## Example
## Conclusion

QUESTION: ${data.question}

MATERIAL FROM THE STUDENT'S PDF:
${passages}`,
      },
    ]);

    await saveOutput(
      context.supabase,
      context.userId,
      data.documentId,
      "exam",
      { subject: data.subject, exam: data.exam, marks: data.marks, question: data.question },
      content,
    );
    return { content };
  });

/* ---------------- Phase 5: flashcards ---------------- */

export const generateFlashcards = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => docInput.extend({ count: z.number().min(4).max(20) }).parse(data))
  .handler(async ({ data, context }) => {
    const { callAiJson, joinChunks } = await import("./ai.server");
    const chunks = await loadChunks(context.supabase, data.documentId);
    const material = joinChunks(chunks, 18000);

    const cards = await callAiJson<{ front: string; back: string }[]>([
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Create exactly ${data.count} revision flashcards from the material below. Return ONLY a JSON array of {"front": string (a question or term), "back": string (a crisp 1-3 sentence answer)}. No markdown fences.\n\nSTUDY MATERIAL:\n${material}`,
      },
    ]);

    await context.supabase.from("flashcards").delete().eq("document_id", data.documentId);
    const { error } = await context.supabase.from("flashcards").insert(
      cards.map((card) => ({
        document_id: data.documentId,
        user_id: context.userId,
        front: card.front,
        back: card.back,
      })),
    );
    if (error) throw new Error(error.message);

    return { count: cards.length };
  });
