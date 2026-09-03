import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { DocumentCard } from "@/components/studymate/DocumentCard";
import { fetchDocuments, toStudyDoc } from "@/lib/documents";

const TITLE = "My Notes — AI StudyMate";
const DESCRIPTION =
  "Every PDF you have uploaded to AI StudyMate, ready for summaries, revision notes and exam answers.";

export const Route = createFileRoute("/_authenticated/notes")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const docsQuery = useQuery({ queryKey: ["documents"], queryFn: fetchDocuments });
  const docs = docsQuery.data ?? [];

  return (
    <>
      <h1 className="font-display text-3xl font-semibold text-card-foreground">My Notes</h1>
      <p className="mt-2 text-muted-foreground">
        Open a document to generate summaries, revision notes, simple explanations, MCQs and exam
        answers.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {docs.map((doc, i) => (
          <Link key={doc.id} to="/documents/$id" params={{ id: doc.id }}>
            <DocumentCard doc={toStudyDoc(doc, i)} />
          </Link>
        ))}
      </div>

      {!docsQuery.isLoading && !docs.length && (
        <p className="mt-8 rounded-xl bg-surface p-5 text-sm text-muted-foreground ring-1 ring-hairline">
          No documents yet.{" "}
          <Link to="/" className="font-medium text-primary hover:underline">
            Upload your first PDF
          </Link>
          .
        </p>
      )}
    </>
  );
}
