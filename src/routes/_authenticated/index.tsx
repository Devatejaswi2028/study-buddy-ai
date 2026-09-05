import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { DocumentCard } from "@/components/studymate/DocumentCard";
import { QuickActions } from "@/components/studymate/QuickActions";
import { StatCard } from "@/components/studymate/StatCard";
import { UploadZone } from "@/components/studymate/UploadZone";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchDocuments, toStudyDoc, uploadPdf } from "@/lib/documents";

const TITLE = "AI StudyMate — Turn your PDFs into summaries, quizzes & flashcards";
const DESCRIPTION =
  "Upload your college notes, textbooks and question papers. AI StudyMate builds smart summaries, exam-ready answers, flashcards and quizzes from your own material.";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user, name } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const docsQuery = useQuery({ queryKey: ["documents"], queryFn: fetchDocuments });
  const attemptsQuery = useQuery({
    queryKey: ["quiz-attempts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("score, total, created_at")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const upload = useMutation({
    mutationFn: async (files: File[]) => {
      if (!user) throw new Error("Not signed in.");
      for (const file of files) await uploadPdf(file, user.id);
    },
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const docs = docsQuery.data ?? [];
  const attempts = attemptsQuery.data ?? [];
  const avg = attempts.length
    ? Math.round(
        (attempts.reduce((sum, a) => sum + a.score / Math.max(a.total, 1), 0) / attempts.length) *
          100,
      )
    : 0;
  const pages = docs.reduce((sum, d) => sum + (d.page_count ?? 0), 0);

  return (
    <>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl leading-tight font-semibold text-balance text-card-foreground sm:text-4xl">
            Welcome back, {name}.
          </h1>
          <p className="mt-2 max-w-[46ch] text-base text-pretty text-muted-foreground">
            Upload a PDF and I'll build summaries, exam answers, flashcards and quizzes straight
            from your own material.
          </p>
        </div>
        <Link
          to="/ask"
          className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground ring-1 ring-primary/40 transition-transform hover:-translate-y-px"
        >
          Ask AI
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Documents" value={String(docs.length)} note="In your library" highlight />
        <StatCard
          label="Avg quiz score"
          value={attempts.length ? `${avg}%` : "—"}
          note={`${attempts.length} attempts`}
        />
        <StatCard label="Pages studied" value={String(pages)} note="Extracted text" />
        <StatCard
          label="Ready to study"
          value={String(docs.filter((d) => d.status === "ready").length)}
          note="Processed documents"
        />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-balance text-card-foreground">
              My Documents
            </h2>
            <Link
              to="/notes"
              className="text-sm font-medium text-primary transition-colors hover:text-card-foreground"
            >
              View all
            </Link>
          </div>

          {upload.isPending && (
            <p className="mb-3 text-sm text-primary">Extracting text from your PDF…</p>
          )}
          {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

          {docsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading your library…</p>
          ) : docs.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {docs.map((doc, i) => (
                <Link key={doc.id} to="/documents/$id" params={{ id: doc.id }}>
                  <DocumentCard doc={toStudyDoc(doc, i)} />
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-surface p-5 text-sm text-muted-foreground ring-1 ring-hairline">
              Nothing here yet — drop your first PDF on the right to begin.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-8">
          <UploadZone onFiles={(files) => upload.mutate(files)} />
          <QuickActions />
        </div>
      </div>
    </>
  );
}
