import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { fetchDocument } from "@/lib/documents";
import { generateExamAnswer, generateMcqs, generateText, type Mcq } from "@/lib/study.functions";

const TITLE = "Study workspace — AI StudyMate";
const DESCRIPTION =
  "Summaries, revision notes, simple explanations, MCQs and exam-ready answers for one of your documents.";

export const Route = createFileRoute("/_authenticated/documents/$id")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DocumentWorkspace,
});

const TABS = ["Summary", "Revision", "Explain", "MCQ", "Exam Mode"] as const;
type Tab = (typeof TABS)[number];

function DocumentWorkspace() {
  const { id } = useParams({ from: "/_authenticated/documents/$id" });
  const docQuery = useQuery({ queryKey: ["document", id], queryFn: () => fetchDocument(id) });
  const doc = docQuery.data;

  const [tab, setTab] = useState<Tab>("Summary");

  return (
    <>
      <h1 className="font-display text-3xl font-semibold text-card-foreground">
        {doc?.title ?? "Loading…"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {doc ? `${doc.page_count ?? 0} pages · ${doc.char_count ?? 0} characters extracted` : ""}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium ring-1 transition-colors ${
              tab === t
                ? "bg-primary/10 text-card-foreground ring-primary/30"
                : "bg-surface text-muted-foreground ring-hairline hover:text-card-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6 max-w-3xl">
        {tab === "Summary" && <TextPanel documentId={id} kind="summary" cta="Generate summary" />}
        {tab === "Revision" && (
          <TextPanel documentId={id} kind="revision" cta="Generate revision notes" />
        )}
        {tab === "Explain" && (
          <TextPanel documentId={id} kind="explain" cta="Explain simply" withTopic />
        )}
        {tab === "MCQ" && <McqPanel documentId={id} />}
        {tab === "Exam Mode" && <ExamPanel documentId={id} />}
      </div>
    </>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-surface-strong p-5 ring-1 ring-hairline">{children}</div>
  );
}

function TextPanel({
  documentId,
  kind,
  cta,
  withTopic,
}: {
  documentId: string;
  kind: "summary" | "revision" | "explain";
  cta: string;
  withTopic?: boolean;
}) {
  const run = useServerFn(generateText);
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setError(null);
    try {
      const result = await run({
        data: { documentId, kind, ...(withTopic && topic ? { topic } : {}) },
      });
      setContent(result.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
    setBusy(false);
  }

  return (
    <Panel>
      {withTopic && (
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Focus on a topic (optional)"
          className="mb-3 w-full rounded-lg bg-background px-3 py-2 text-sm text-foreground ring-1 ring-input outline-none placeholder:text-faint focus:ring-primary/50"
        />
      )}
      <button
        type="button"
        onClick={go}
        disabled={busy}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-px disabled:opacity-60"
      >
        {busy ? "Working…" : cta}
      </button>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      {content && (
        <p className="mt-4 text-sm whitespace-pre-wrap text-muted-foreground">{content}</p>
      )}
    </Panel>
  );
}

function McqPanel({ documentId }: { documentId: string }) {
  const run = useServerFn(generateMcqs);
  const [mcqs, setMcqs] = useState<Mcq[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setError(null);
    try {
      const result = await run({ data: { documentId, count: 5 } });
      setMcqs(result.mcqs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
    setBusy(false);
  }

  return (
    <Panel>
      <button
        type="button"
        onClick={go}
        disabled={busy}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-px disabled:opacity-60"
      >
        {busy ? "Writing questions…" : "Generate MCQs"}
      </button>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-4 flex flex-col gap-4">
        {mcqs.map((q, i) => (
          <div key={i}>
            <p className="text-sm font-semibold text-card-foreground">
              {i + 1}. {q.question}
            </p>
            <ul className="mt-1.5 flex flex-col gap-1">
              {q.options.map((o, oi) => (
                <li
                  key={oi}
                  className={`text-sm ${oi === q.answerIndex ? "text-primary" : "text-muted-foreground"}`}
                >
                  {String.fromCharCode(65 + oi)}. {o}
                </li>
              ))}
            </ul>
            <p className="mt-1.5 text-[13px] text-faint">{q.explanation}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

const EXAMS = ["Mid-term", "End-term", "Internal", "Practice"] as const;
const MARKS = ["2", "5", "6", "10"] as const;

function ExamPanel({ documentId }: { documentId: string }) {
  const run = useServerFn(generateExamAnswer);
  const [subject, setSubject] = useState("");
  const [exam, setExam] = useState<(typeof EXAMS)[number]>("Mid-term");
  const [marks, setMarks] = useState<(typeof MARKS)[number]>("6");
  const [question, setQuestion] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await run({ data: { documentId, subject, exam, marks, question } });
      setContent(result.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
    setBusy(false);
  }

  const field =
    "rounded-lg bg-background px-3 py-2 text-sm text-foreground ring-1 ring-input outline-none placeholder:text-faint focus:ring-primary/50";

  return (
    <Panel>
      <form onSubmit={go} className="flex flex-col gap-3">
        <input
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject, e.g. Responsible AI"
          className={field}
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            value={exam}
            onChange={(e) => setExam(e.target.value as (typeof EXAMS)[number])}
            className={field}
          >
            {EXAMS.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
          <select
            value={marks}
            onChange={(e) => setMarks(e.target.value as (typeof MARKS)[number])}
            className={field}
          >
            {MARKS.map((m) => (
              <option key={m} value={m}>
                {m} marks
              </option>
            ))}
          </select>
        </div>
        <textarea
          required
          rows={2}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Exam question"
          className={field}
        />
        <button
          type="submit"
          disabled={busy}
          className="self-start rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-px disabled:opacity-60"
        >
          {busy ? "Writing answer…" : "Generate exam answer"}
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      {content && (
        <p className="mt-4 text-sm whitespace-pre-wrap text-muted-foreground">{content}</p>
      )}
    </Panel>
  );
}
