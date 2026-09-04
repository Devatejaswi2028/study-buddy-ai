import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { DocumentPicker } from "@/components/studymate/DocumentPicker";
import { fetchDocuments } from "@/lib/documents";
import { supabase } from "@/integrations/supabase/client";
import { generateFlashcards } from "@/lib/study.functions";

const TITLE = "Flashcards — AI StudyMate";
const DESCRIPTION =
  "Turn any uploaded PDF into a revision flashcard deck and flip through it before your exam.";

export const Route = createFileRoute("/_authenticated/flashcards")({
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
  component: FlashcardsPage,
});

type Card = { id: string; front: string; back: string };

function FlashcardsPage() {
  const queryClient = useQueryClient();
  const docsQuery = useQuery({ queryKey: ["documents"], queryFn: fetchDocuments });
  const docs = docsQuery.data ?? [];
  const [docId, setDocId] = useState<string | null>(null);
  const activeId = docId ?? docs[0]?.id ?? null;

  const cardsQuery = useQuery({
    queryKey: ["flashcards", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flashcards")
        .select("id, front, back")
        .eq("document_id", activeId!)
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []) as Card[];
    },
  });

  const generate = useServerFn(generateFlashcards);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  async function build() {
    if (!activeId) return;
    setBusy(true);
    setError(null);
    try {
      await generate({ data: { documentId: activeId, count: 10 } });
      await queryClient.invalidateQueries({ queryKey: ["flashcards", activeId] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not build the deck.");
    }
    setBusy(false);
  }

  const cards = cardsQuery.data ?? [];

  return (
    <>
      <h1 className="font-display text-3xl font-semibold text-card-foreground">Flashcards</h1>
      <p className="mt-2 text-muted-foreground">Tap a card to reveal the answer.</p>

      <div className="mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <DocumentPicker docs={docs} value={activeId} onChange={setDocId} />
        </div>
        <button
          type="button"
          onClick={build}
          disabled={busy || !activeId}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-px disabled:opacity-60"
        >
          {busy ? "Building deck…" : cards.length ? "Rebuild deck" : "Create deck"}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => setFlipped((f) => ({ ...f, [card.id]: !f[card.id] }))}
            className="min-h-36 rounded-2xl bg-surface-strong p-5 text-left ring-1 ring-hairline transition-transform hover:-translate-y-1 hover:ring-primary/30"
          >
            <p className="text-[10px] font-semibold tracking-[0.16em] text-faint uppercase">
              {flipped[card.id] ? "Answer" : "Question"}
            </p>
            <p className="mt-2 text-sm text-card-foreground">
              {flipped[card.id] ? card.back : card.front}
            </p>
          </button>
        ))}
      </div>

      {!cards.length && !cardsQuery.isLoading && (
        <p className="mt-8 rounded-xl bg-surface p-5 text-sm text-muted-foreground ring-1 ring-hairline">
          No cards for this document yet — create a deck above.
        </p>
      )}
    </>
  );
}
