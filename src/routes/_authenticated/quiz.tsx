import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { DocumentPicker } from "@/components/studymate/DocumentPicker";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchDocuments } from "@/lib/documents";
import { generateMcqs, type Mcq } from "@/lib/study.functions";

const TITLE = "Quiz Mode — AI StudyMate";
const DESCRIPTION =
  "Take an interactive multiple-choice quiz generated from your own PDF and track your score.";

export const Route = createFileRoute("/_authenticated/quiz")({
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
  component: QuizPage,
});

function QuizPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const docsQuery = useQuery({ queryKey: ["documents"], queryFn: fetchDocuments });
  const docs = docsQuery.data ?? [];
  const [docId, setDocId] = useState<string | null>(null);
  const activeId = docId ?? docs[0]?.id ?? null;

  const make = useServerFn(generateMcqs);
  const [questions, setQuestions] = useState<Mcq[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    if (!activeId) return;
    setBusy(true);
    setError(null);
    setSubmitted(false);
    setAnswers({});
    try {
      const result = await make({ data: { documentId: activeId, count: 5 } });
      setQuestions(result.mcqs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not build the quiz.");
    }
    setBusy(false);
  }

  const score = questions.reduce((sum, q, i) => sum + (answers[i] === q.answerIndex ? 1 : 0), 0);

  async function finish() {
    setSubmitted(true);
    if (!user || !activeId) return;
    const doc = docs.find((d) => d.id === activeId);
    await supabase.from("quiz_attempts").insert({
      user_id: user.id,
      document_id: activeId,
      topic: doc?.title ?? "General",
      score,
      total: questions.length,
    });
    queryClient.invalidateQueries({ queryKey: ["quiz-attempts"] });
  }

  return (
    <>
      <h1 className="font-display text-3xl font-semibold text-card-foreground">Quiz Mode</h1>
      <p className="mt-2 text-muted-foreground">
        Five questions straight from your material. Your score is saved to Progress.
      </p>

      <div className="mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <DocumentPicker docs={docs} value={activeId} onChange={setDocId} />
        </div>
        <button
          type="button"
          onClick={start}
          disabled={busy || !activeId}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-px disabled:opacity-60"
        >
          {busy ? "Preparing…" : questions.length ? "New quiz" : "Start quiz"}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-8 flex max-w-3xl flex-col gap-4">
        {questions.map((q, i) => (
          <article key={i} className="rounded-2xl bg-surface-strong p-5 ring-1 ring-hairline">
            <p className="text-sm font-semibold text-card-foreground">
              {i + 1}. {q.question}
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {q.options.map((option, oi) => {
                const picked = answers[i] === oi;
                const correct = submitted && oi === q.answerIndex;
                const wrong = submitted && picked && oi !== q.answerIndex;
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={submitted}
                    onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                    className={`rounded-lg px-3 py-2 text-left text-sm ring-1 transition-colors ${
                      correct
                        ? "bg-primary/15 text-card-foreground ring-primary/40"
                        : wrong
                          ? "bg-destructive/10 text-card-foreground ring-destructive/40"
                          : picked
                            ? "bg-surface text-card-foreground ring-primary/30"
                            : "bg-surface text-muted-foreground ring-hairline hover:text-card-foreground"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <p className="mt-3 text-[13px] text-muted-foreground">{q.explanation}</p>
            )}
          </article>
        ))}
      </div>

      {questions.length > 0 && !submitted && (
        <button
          type="button"
          onClick={finish}
          className="mt-6 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-px"
        >
          Submit answers
        </button>
      )}

      {submitted && (
        <p className="mt-6 rounded-xl bg-surface p-5 text-sm text-card-foreground ring-1 ring-hairline">
          You scored <span className="font-semibold text-primary">{score}</span> out of{" "}
          {questions.length}.
        </p>
      )}
    </>
  );
}
