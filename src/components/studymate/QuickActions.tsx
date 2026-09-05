import { Link } from "@tanstack/react-router";

const ACTIONS = [
  { label: "Ask AI", note: "Answers from your PDF", to: "/ask" },
  { label: "Generate Quiz", note: "Interactive MCQ round", to: "/quiz" },
  { label: "Summarize", note: "Smart notes in seconds", to: "/notes" },
  { label: "Flashcards", note: "Fast revision deck", to: "/flashcards" },
] as const;

export function QuickActions() {
  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-semibold text-balance text-card-foreground">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className="rounded-xl bg-surface p-3.5 text-left ring-1 ring-hairline transition-transform hover:-translate-y-0.5 hover:ring-primary/30"
          >
            <p className="text-sm font-semibold text-card-foreground">{action.label}</p>
            <p className="mt-1 text-[11px] text-faint">{action.note}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
