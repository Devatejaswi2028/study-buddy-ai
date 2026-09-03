const ACTIONS = [
  { icon: "💬", title: "Ask AI", note: "From your notes", tone: "primary" as const },
  { icon: "✍️", title: "Exam Mode", note: "6-mark answers", tone: "accent" as const },
  { icon: "🃏", title: "Flashcards", note: "Revision deck", tone: "primary" as const },
  { icon: "🎯", title: "Quiz Mode", note: "Test yourself", tone: "accent" as const },
];

export function QuickActions() {
  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-semibold text-balance text-card-foreground">
        Quick actions
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map((action) => (
          <button
            key={action.title}
            type="button"
            className={`rounded-xl bg-surface-strong p-3.5 text-left ring-1 ring-hairline transition-transform hover:-translate-y-0.5 ${
              action.tone === "primary" ? "hover:ring-primary/30" : "hover:ring-accent/30"
            }`}
          >
            <span className="text-lg">{action.icon}</span>
            <p className="mt-2 text-sm font-medium text-card-foreground">{action.title}</p>
            <p className="text-[11px] text-faint">{action.note}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
