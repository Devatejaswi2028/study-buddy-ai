const NAV = [
  { label: "Dashboard", active: true },
  { label: "My Notes", active: false },
  { label: "Ask AI", active: false },
  { label: "Quiz", active: false },
  { label: "Flashcards", active: false },
  { label: "Progress", active: false },
];

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-hairline bg-surface px-4 py-6 backdrop-blur-xl lg:flex">
      <div className="flex items-center gap-2.5 px-2">
        <div className="grid size-9 place-items-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
          <span className="font-display text-lg font-semibold text-primary">A</span>
        </div>
        <div className="leading-tight">
          <p className="font-display text-[15px] font-semibold text-card-foreground">StudyMate</p>
          <p className="text-[11px] text-faint">AI study desk</p>
        </div>
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.18em] text-faint uppercase">
          Workspace
        </p>
        {NAV.map((item) =>
          item.active ? (
            <span
              key={item.label}
              aria-current="page"
              className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-card-foreground ring-1 ring-primary/20"
            >
              <span className="size-1.5 rounded-full bg-primary" />
              {item.label}
            </span>
          ) : (
            <span
              key={item.label}
              title="Coming in a later phase"
              className="flex cursor-default items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-card-foreground"
            >
              <span className="size-1.5 rounded-full bg-muted" />
              {item.label}
            </span>
          ),
        )}
      </nav>

      <div className="mt-auto rounded-xl bg-surface p-3 ring-1 ring-hairline">
        <p className="text-[11px] font-medium text-foreground">Weekly focus</p>
        <p className="mt-1 text-[11px] text-faint">4 lessons · 2 quizzes left</p>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-input">
          <div className="h-full w-2/3 rounded-full bg-primary" />
        </div>
      </div>
    </aside>
  );
}
