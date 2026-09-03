import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AuroraBackground } from "@/components/studymate/AuroraBackground";
import { DocumentCard, type StudyDoc } from "@/components/studymate/DocumentCard";
import { QuickActions } from "@/components/studymate/QuickActions";
import { Sidebar } from "@/components/studymate/Sidebar";
import { StatCard } from "@/components/studymate/StatCard";
import { UploadZone } from "@/components/studymate/UploadZone";

const TITLE = "AI StudyMate — Turn your PDFs into summaries, quizzes & flashcards";
const DESCRIPTION =
  "Upload your college notes, textbooks and question papers. AI StudyMate builds smart summaries, exam-ready answers, flashcards and quizzes from your own material.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Dashboard,
});

const SEED_DOCS: StudyDoc[] = [
  {
    id: "1",
    title: "Responsible AI",
    subtitle: "Ethics & accountability unit",
    code: "AI",
    tone: "primary",
    meta: "24 pages · 1.8 MB",
    added: "2 d ago",
    progress: 80,
    status: "80% processed · 3 flashcards ready",
  },
  {
    id: "2",
    title: "DBMS Notes",
    subtitle: "Normalization & indexing",
    code: "DB",
    tone: "accent",
    meta: "41 pages · 3.2 MB",
    added: "5 d ago",
    progress: 100,
    status: "Processed · 12 flashcards ready",
  },
  {
    id: "3",
    title: "Operating Systems",
    subtitle: "Scheduling & memory mgmt",
    code: "OS",
    tone: "primary",
    meta: "67 pages · 4.9 MB",
    added: "1 wk ago",
    progress: 50,
    status: "50% processed · summarizing…",
  },
  {
    id: "4",
    title: "Computer Networks",
    subtitle: "TCP/IP & routing",
    code: "NET",
    tone: "accent",
    meta: "33 pages · 2.4 MB",
    added: "2 wk ago",
    progress: 100,
    status: "Processed · 8 flashcards ready",
  },
];

function initials(name: string) {
  const base = name.replace(/\.pdf$/i, "").trim();
  const parts = base.split(/[\s_-]+/).filter(Boolean);
  const letters = parts.map((p) => p[0]).join("");
  return (letters || base.slice(0, 2)).slice(0, 3).toUpperCase();
}

function Dashboard() {
  const [docs, setDocs] = useState<StudyDoc[]>(SEED_DOCS);

  function addFiles(files: File[]) {
    setDocs((prev) => [
      ...files.map((file, i) => ({
        id: `${Date.now()}-${i}`,
        title: file.name.replace(/\.pdf$/i, ""),
        subtitle: "Waiting to be processed",
        code: initials(file.name),
        tone: (prev.length + i) % 2 === 0 ? ("primary" as const) : ("accent" as const),
        meta: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        added: "Just now",
        progress: 0,
        status: "Queued · text extraction next",
      })),
      ...prev,
    ]);
  }

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AuroraBackground />

      <div className="flex min-h-screen">
        <Sidebar />

        <main className="min-w-0 flex-1">
          <header className="border-b border-hairline">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
              <p className="hidden text-sm sm:block">
                <span className="text-faint">{today} ·</span>
                <span className="text-foreground"> Good evening</span>
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-card-foreground"
                >
                  Search
                </button>
                <div className="flex items-center gap-2.5 rounded-full bg-surface py-1 pr-3 pl-1 ring-1 ring-hairline">
                  <div className="grid size-8 place-items-center rounded-full bg-accent/15 text-sm font-semibold text-accent ring-1 ring-accent/30">
                    T
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-medium text-card-foreground">Tejaswi</p>
                    <p className="text-[11px] text-faint">CE, 3rd yr</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-6xl px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="font-display text-3xl leading-tight font-semibold text-balance text-card-foreground sm:text-4xl">
                  Welcome back, Tejaswi.
                </h1>
                <p className="mt-2 max-w-[46ch] text-base text-pretty text-muted-foreground">
                  Your desk is set — 3 uploads ready to process. Pick a subject and I'll build
                  summaries, quizzes and flashcards from your PDFs.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-lg py-2 pr-4 pl-2 text-sm font-medium text-foreground ring-1 ring-border transition-colors hover:bg-surface"
                >
                  <span className="mr-2 inline-block size-4 shrink-0 align-middle">⊞</span>New note
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-primary py-2 pr-4 pl-3 text-sm font-semibold text-primary-foreground ring-1 ring-primary/40 transition-transform hover:-translate-y-px"
                >
                  <span className="mr-1.5 inline-block size-4 shrink-0 align-middle">↑</span>Upload
                  PDF
                </button>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard
                label="Documents"
                value={String(docs.length)}
                note="3 new this week"
                highlight
              />
              <StatCard label="Avg quiz score" value="84%" note="Trending up 6%" />
              <StatCard label="Streak" value="9 days" note="Best: 14 days" />
              <StatCard label="Topics mastered" value="18" note="of 32 planned" />
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold text-balance text-card-foreground">
                    My Documents
                  </h2>
                  <button
                    type="button"
                    className="text-sm font-medium text-primary transition-colors hover:text-card-foreground"
                  >
                    View all
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {docs.map((doc) => (
                    <DocumentCard key={doc.id} doc={doc} />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-8">
                <UploadZone onFiles={addFiles} />
                <QuickActions />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
