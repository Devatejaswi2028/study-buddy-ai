export function StatCard({
  label,
  value,
  note,
  highlight = false,
}: {
  label: string;
  value: string;
  note: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl bg-surface p-4 ring-1 ring-hairline">
      <p className="text-[11px] tracking-[0.14em] text-faint uppercase">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-semibold text-card-foreground">{value}</p>
      <p className={`mt-1 text-[11px] ${highlight ? "text-primary" : "text-faint"}`}>{note}</p>
    </div>
  );
}
