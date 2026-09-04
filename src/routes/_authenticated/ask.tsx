import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { DocumentPicker } from "@/components/studymate/DocumentPicker";
import { fetchDocuments } from "@/lib/documents";
import { askDocument } from "@/lib/study.functions";

const TITLE = "Ask AI — AI StudyMate";
const DESCRIPTION =
  "Ask questions directly from your uploaded PDFs and get answers grounded in your own study material.";

export const Route = createFileRoute("/_authenticated/ask")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AskPage,
});

type Turn = { question: string; answer: string };

function AskPage() {
  const docsQuery = useQuery({ queryKey: ["documents"], queryFn: fetchDocuments });
  const docs = docsQuery.data ?? [];
  const ask = useServerFn(askDocument);

  const [docId, setDocId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeId = docId ?? docs[0]?.id ?? null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId || !question.trim()) return;
    setBusy(true);
    setError(null);
    const q = question.trim();
    setQuestion("");
    try {
      const result = await ask({ data: { documentId: activeId, question: q } });
      setTurns((prev) => [{ question: q, answer: result.answer }, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not answer that. Try again.");
    }
    setBusy(false);
  }

  return (
    <>
      <h1 className="font-display text-3xl font-semibold text-card-foreground">Ask AI</h1>
      <p className="mt-2 text-muted-foreground">
        Every answer is built only from the document you pick.
      </p>

      <div className="mt-6 max-w-xl">
        <DocumentPicker docs={docs} value={activeId} onChange={setDocId} />
      </div>

      <form onSubmit={submit} className="mt-4 flex max-w-2xl flex-col gap-3">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          placeholder="e.g. What are the pillars of responsible AI?"
          className="rounded-xl bg-surface px-3.5 py-3 text-sm text-card-foreground ring-1 ring-input outline-none placeholder:text-faint focus:ring-primary/50"
        />
        <button
          type="submit"
          disabled={busy || !activeId}
          className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-px disabled:opacity-60"
        >
          {busy ? "Thinking…" : "Ask"}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-8 flex max-w-3xl flex-col gap-4">
        {turns.map((turn, i) => (
          <article key={i} className="rounded-2xl bg-surface-strong p-5 ring-1 ring-hairline">
            <p className="text-sm font-semibold text-card-foreground">{turn.question}</p>
            <p className="mt-3 text-sm whitespace-pre-wrap text-muted-foreground">{turn.answer}</p>
          </article>
        ))}
      </div>
    </>
  );
}
