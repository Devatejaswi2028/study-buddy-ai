import { useRef, useState } from "react";

const MAX_BYTES = 25 * 1024 * 1024;

export function UploadZone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function accept(list: FileList | null) {
    if (!list) return;
    const files = Array.from(list);
    const pdfs = files.filter((f) => f.type === "application/pdf");
    const tooBig = pdfs.filter((f) => f.size > MAX_BYTES);
    const ok = pdfs.filter((f) => f.size <= MAX_BYTES);

    if (pdfs.length !== files.length) setError("Only PDF files are supported.");
    else if (tooBig.length) setError("Each file must be under 25 MB.");
    else setError(null);

    if (ok.length) onFiles(ok);
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-semibold text-balance text-card-foreground">
        Upload
      </h2>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          accept(e.dataTransfer.files);
        }}
        className={`relative overflow-hidden rounded-2xl border border-dashed bg-surface p-6 text-center transition-colors ${
          dragging ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-primary/30 ring-1 ring-primary/10"
        }`}
      >
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/25">
          <span className="text-xl">↑</span>
        </div>
        <p className="mt-3.5 text-sm font-medium text-card-foreground">Drop your PDF here</p>
        <p className="mt-1 text-[13px] text-faint">Notes, textbooks, question papers</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground ring-1 ring-primary/40 transition-transform hover:-translate-y-px"
        >
          Browse files
        </button>
        <p className="mt-3 text-[11px] text-faint">Up to 25 MB · PDF only</p>
        {error && <p className="mt-2 text-[11px] text-destructive">{error}</p>}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="sr-only"
          onChange={(e) => {
            accept(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
