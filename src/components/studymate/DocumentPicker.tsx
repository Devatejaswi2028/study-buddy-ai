import { Link } from "@tanstack/react-router";

import type { DocRow } from "@/lib/documents";

export function DocumentPicker({
  docs,
  value,
  onChange,
  label = "Study material",
}: {
  docs: DocRow[];
  value: string | null;
  onChange: (id: string) => void;
  label?: string;
}) {
  if (!docs.length) {
    return (
      <div className="rounded-xl bg-surface p-4 text-sm text-muted-foreground ring-1 ring-hairline">
        No documents yet.{" "}
        <Link to="/" className="font-medium text-primary hover:underline">
          Upload a PDF
        </Link>{" "}
        to get started.
      </div>
    );
  }

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold tracking-[0.14em] text-faint uppercase">
        {label}
      </span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg bg-surface px-3 py-2 text-sm text-card-foreground ring-1 ring-input outline-none focus:ring-primary/50"
      >
        <option value="" disabled>
          Choose a document
        </option>
        {docs.map((doc) => (
          <option key={doc.id} value={doc.id}>
            {doc.title}
          </option>
        ))}
      </select>
    </label>
  );
}
