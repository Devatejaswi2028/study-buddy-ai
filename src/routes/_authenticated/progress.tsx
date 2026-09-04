import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { StatCard } from "@/components/studymate/StatCard";
import { supabase } from "@/integrations/supabase/client";
import { fetchDocuments } from "@/lib/documents";

const TITLE = "Progress — AI StudyMate";
const DESCRIPTION =
  "Track your quiz scores, topics covered and how much of your study material you have processed.";

export const Route = createFileRoute("/_authenticated/progress")({
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
  component: ProgressPage,
});

type Attempt = {
  id: string;
  topic: string | null;
  score: number;
  total: number;
  created_at: string;
};

function ProgressPage() {
  const docsQuery = useQuery({ queryKey: ["documents"], queryFn: fetchDocuments });
  const attemptsQuery = useQuery({
    queryKey: ["quiz-attempts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("id, topic, score, total, created_at")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as Attempt[];
    },
  });

  const attempts = attemptsQuery.data ?? [];
  const docs = docsQuery.data ?? [];
  const avg = attempts.length
    ? Math.round(
        (attempts.reduce((s, a) => s + a.score / Math.max(a.total, 1), 0) / attempts.length) * 100,
      )
    : 0;
  const best = attempts.length
    ? Math.round(Math.max(...attempts.map((a) => (a.score / Math.max(a.total, 1)) * 100)))
    : 0;
  const topics = new Set(attempts.map((a) => a.topic).filter(Boolean)).size;

  return (
    <>
      <h1 className="font-display text-3xl font-semibold text-card-foreground">Progress</h1>
      <p className="mt-2 text-muted-foreground">Every quiz you take is recorded here.</p>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Avg score"
          value={attempts.length ? `${avg}%` : "—"}
          note={`${attempts.length} attempts`}
          highlight
        />
        <StatCard label="Best score" value={attempts.length ? `${best}%` : "—"} note="Personal best" />
        <StatCard label="Topics quizzed" value={String(topics)} note="Distinct documents" />
        <StatCard label="Documents" value={String(docs.length)} note="In your library" />
      </div>

      <h2 className="mt-10 mb-4 font-display text-lg font-semibold text-card-foreground">
        Recent attempts
      </h2>

      {attempts.length ? (
        <div className="flex flex-col gap-2">
          {attempts.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 ring-1 ring-hairline"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-card-foreground">
                  {a.topic ?? "Quiz"}
                </p>
                <p className="text-[11px] text-faint">
                  {new Date(a.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-primary">
                {a.score}/{a.total}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-surface p-5 text-sm text-muted-foreground ring-1 ring-hairline">
          No quiz attempts yet — take a quiz to start tracking your progress.
        </p>
      )}
    </>
  );
}
