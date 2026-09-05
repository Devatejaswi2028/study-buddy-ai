# Architecture

## Overview

AI StudyMate is a single full-stack React application. The browser handles PDF
parsing and UI; server functions handle every AI call so the API key never
leaves the server; Supabase Postgres stores documents, chunks and results with
Row Level Security.

```
┌────────────────────────── Browser ───────────────────────────┐
│  React 19 + TanStack Router                                  │
│  • pdfjs-dist extracts text from the PDF                     │
│  • text is chunked (1400 chars, 180 overlap)                 │
│  • document + chunks inserted via Supabase client (RLS)      │
│  • UI calls server functions for anything AI-related         │
└───────────────┬──────────────────────────────────────────────┘
                │ typed RPC (createServerFn)
┌───────────────▼──────────── Server (edge) ───────────────────┐
│  src/lib/study.functions.ts                                  │
│  • requireSupabaseAuth middleware → context.supabase, userId │
│  • loads chunks for the document (as the user, RLS applies)  │
│  • retrieveChunks() picks the most relevant chunks           │
│  • calls the AI gateway with a task-specific prompt          │
│  • saves the result into study_outputs / flashcards          │
└───────────────┬──────────────────────────────────────────────┘
                │
┌───────────────▼─────────┐        ┌─────────────────────────┐
│ Supabase Postgres + RLS │        │ AI Gateway (Gemini Flash)│
└─────────────────────────┘        └─────────────────────────┘
```

## The RAG pipeline

1. **Extract** — `src/lib/pdf.ts → extractPdfText(file)` runs `pdfjs-dist` in
   the browser and concatenates the text of every page.
2. **Chunk** — `chunkText(text, 1400, 180)` splits the text into overlapping
   windows so no idea is cut in half at a boundary.
3. **Store** — `src/lib/documents.ts → uploadPdf()` inserts one `documents` row
   and one `document_chunks` row per chunk, then flips status to `ready`.
4. **Retrieve** — `src/lib/ai.server.ts → retrieveChunks(chunks, question, 6)`
   scores chunks by keyword overlap with the question and returns the top 6.
   (Lightweight, dependency-free, and fast; swappable for pgvector embeddings.)
5. **Generate** — the retrieved text is joined (capped at ~24,000 chars) and
   sent to the model with a task-specific system prompt.
6. **Persist** — the answer is written to `study_outputs` (or `flashcards`) so
   repeat visits are instant.

## Request flow example: "Generate a 6-mark exam answer"

```
Study workspace (documents.$id.tsx)
  → useServerFn(generateExamAnswer)({ documentId, subject, exam, marks, question })
    → requireSupabaseAuth middleware attaches the user's bearer token
      → loadChunks(documentId) via context.supabase   [RLS: own rows only]
        → retrieveChunks() + joinChunks()
          → callAi([system prompt, user prompt])      [AI gateway]
            → saveOutput(kind: "exam", params, content)
              → rendered as Definition → Explanation → Key Points → Example → Conclusion
```

## Routing

File-based, under `src/routes/`:

| File | URL | Purpose |
| --- | --- | --- |
| `__root.tsx` | — | HTML shell, global metadata, providers |
| `auth.tsx` | `/auth` | Sign in / sign up (email + Google) |
| `_authenticated/route.tsx` | — | Auth gate + app shell (sidebar, header, footer) |
| `_authenticated/index.tsx` | `/` | Dashboard: stats, documents, upload, quick actions |
| `_authenticated/notes.tsx` | `/notes` | All uploaded documents |
| `_authenticated/ask.tsx` | `/ask` | Ask AI chat |
| `_authenticated/quiz.tsx` | `/quiz` | Interactive quiz mode |
| `_authenticated/flashcards.tsx` | `/flashcards` | Flashcard deck |
| `_authenticated/progress.tsx` | `/progress` | Score history |
| `_authenticated/documents.$id.tsx` | `/documents/:id` | Study workspace, 5 tabs |

`_authenticated` is a pathless layout: it does not appear in the URL, but every
route under it redirects to `/auth` when there is no session.

## Security boundaries

| Concern | How it is handled |
| --- | --- |
| Data isolation | RLS policy `auth.uid() = user_id` on every table |
| API key exposure | AI calls only inside `createServerFn().handler()` |
| Auth on server functions | `requireSupabaseAuth` middleware → 401 without a session |
| Privilege escalation | No roles stored on profiles; trigger function is `REVOKE`d from public |
| CSRF | `csrfMiddleware` registered in `src/start.ts` for server functions |

## Why these choices

- **TanStack Start** gives server-side rendering and typed server functions in
  one codebase — no separate FastAPI service to deploy or keep in sync.
- **Browser-side PDF parsing** keeps large files off the server and makes
  upload feel instant.
- **Keyword retrieval instead of embeddings** removes the vector database from
  the critical path; the interface (`retrieveChunks`) is a drop-in seam for
  pgvector later.
- **Result caching in `study_outputs`** avoids paying for the same generation
  twice.
