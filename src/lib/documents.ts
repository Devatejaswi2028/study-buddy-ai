import { supabase } from "@/integrations/supabase/client";
import { chunkText, extractPdfText } from "@/lib/pdf";

export type DocRow = {
  id: string;
  title: string;
  subject: string | null;
  page_count: number | null;
  size_bytes: number | null;
  char_count: number | null;
  status: string;
  created_at: string;
};

export async function fetchDocuments(): Promise<DocRow[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("id, title, subject, page_count, size_bytes, char_count, status, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as DocRow[];
}

export async function fetchDocument(id: string): Promise<DocRow | null> {
  const { data, error } = await supabase
    .from("documents")
    .select("id, title, subject, page_count, size_bytes, char_count, status, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as DocRow) ?? null;
}

/** Extracts a PDF in the browser, then stores the document and its chunks. */
export async function uploadPdf(file: File, userId: string): Promise<DocRow> {
  const title = file.name.replace(/\.pdf$/i, "").trim() || "Untitled";
  const { pageCount, text } = await extractPdfText(file);
  if (!text || text.length < 40) {
    throw new Error(
      `No readable text found in "${title}". Scanned PDFs (images) aren't supported yet.`,
    );
  }

  const { data: doc, error } = await supabase
    .from("documents")
    .insert({
      user_id: userId,
      title,
      page_count: pageCount,
      size_bytes: file.size,
      char_count: text.length,
      status: "processing",
    })
    .select("id, title, subject, page_count, size_bytes, char_count, status, created_at")
    .single();
  if (error) throw new Error(error.message);

  const chunks = chunkText(text);
  const { error: chunkError } = await supabase.from("document_chunks").insert(
    chunks.map((content, index) => ({
      document_id: doc.id,
      user_id: userId,
      chunk_index: index,
      content,
    })),
  );
  if (chunkError) throw new Error(chunkError.message);

  await supabase.from("documents").update({ status: "ready" }).eq("id", doc.id);
  return { ...(doc as DocRow), status: "ready" };
}

export function docInitials(title: string) {
  const parts = title.split(/[\s_-]+/).filter(Boolean);
  const letters = parts.map((p) => p[0]).join("");
  return (letters || title.slice(0, 2)).slice(0, 3).toUpperCase();
}

export function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} d ago`;
  return `${Math.floor(days / 7)} wk ago`;
}

export function toStudyDoc(doc: DocRow, i: number) {
  return {
    id: doc.id,
    title: doc.title,
    subtitle: doc.subject ?? `${doc.char_count ?? 0} characters extracted`,
    code: docInitials(doc.title),
    tone: (i % 2 === 0 ? "primary" : "accent") as "primary" | "accent",
    meta: `${doc.page_count ?? 0} pages · ${((doc.size_bytes ?? 0) / (1024 * 1024)).toFixed(1)} MB`,
    added: timeAgo(doc.created_at),
    progress: doc.status === "ready" ? 100 : 40,
    status: doc.status === "ready" ? "Processed · ready to study" : "Processing…",
  };
}
