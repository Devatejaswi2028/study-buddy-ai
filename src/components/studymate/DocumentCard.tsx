export type StudyDoc = {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  tone: "primary" | "accent";
  meta: string;
  added: string;
  progress: number;
  status: string;
};

export function DocumentCard({ doc }: { doc: StudyDoc }) {
  const tone = doc.tone === "primary";

  return (
    <article
      className={`group rounded-2xl bg-surface-strong p-4 ring-1 ring-hairline transition-transform hover:-translate-y-1 ${
        tone ? "hover:ring-primary/30" : "hover:ring-accent/30"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`grid size-11 shrink-0 place-items-center rounded-lg text-sm font-semibold ${
            tone
              ? "bg-primary/10 text-primary ring-1 ring-primary/25"
              : "bg-accent/10 text-accent ring-1 ring-accent/25"
          }`}
        >
          {doc.code}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[15px] font-semibold text-card-foreground">
            {doc.title}
          </h3>
          <p className="truncate text-[13px] text-faint">{doc.subtitle}</p>
        </div>
        <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-accent uppercase ring-1 ring-accent/25">
          PDF
        </span>
      </div>

      <div className="mt-3.5 border-t border-hairline pt-3">
        <div className="flex items-center justify-between text-[11px] text-faint">
          <span>{doc.meta}</span>
          <span>{doc.added}</span>
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-input">
          <div
            className={`h-full rounded-full ${tone ? "bg-primary" : "bg-accent"}`}
            style={{ width: `${doc.progress}%` }}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-faint">{doc.status}</p>
      </div>
    </article>
  );
}
