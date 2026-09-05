# 🎓 AI StudyMate

> Turn any PDF into summaries, flashcards, MCQs, exam-ready answers and interactive quizzes — powered by AI.

**Built by [Deva Tejaswi Jupudi](https://github.com/)**
Live demo: https://study-buddy-ai-7165.lovable.app

---

## 📖 What it is

AI StudyMate is a study companion for college students. Upload your notes,
textbook chapters or question papers as a PDF, and the app reads them and
generates everything you need to revise: concise summaries, simple
explanations, revision keywords, multiple-choice questions, structured exam
answers (2 / 5 / 6 / 10 marks) and flashcards. You can also chat directly
with your document and track your quiz scores over time.

```
Student → Upload PDF → Extract text → Chunk → Store
                                        │
             ┌──────────────┬───────────┼───────────┬──────────────┐
             ▼              ▼           ▼           ▼              ▼
          Ask AI        Summary       MCQs     Exam Answer    Flashcards
          (RAG)          (LLM)        (LLM)       (LLM)          (LLM)
```

---

## ✨ Features

| Feature | What it does |
| --- | --- |
| 📄 **PDF Upload** | Drag-and-drop notes, textbooks or question papers (PDF, max 25 MB) |
| 📝 **Smart Summary** | Condenses a document into concise study notes |
| 💬 **Ask AI** | Ask questions answered from your own material (retrieval-augmented) |
| 🧠 **Explain Simply** | Rewrites hard concepts in plain language |
| ❓ **MCQ Generator** | Auto-generates multiple-choice questions with answers |
| ✍️ **Exam Answers** | 2 / 5 / 6 / 10-mark answers in exam format |
| 🃏 **Flashcards** | Front/back revision cards, flip to reveal |
| 📚 **Revision Notes** | Key points and keywords for last-minute revision |
| 🎯 **Quiz Mode** | Interactive quiz built from your PDF, scored instantly |
| 📊 **Progress** | Quiz history, average score and topics covered |

### 🔥 Exam Mode (the standout feature)

Pick a **subject**, an **exam type** (Mid-term / End-term / Internal / Practice)
and a **mark weight**, and the AI writes an exam-ready answer in the structure
examiners expect:

```
Definition → Explanation → Key Points → Example → Conclusion
```

---

## 🧠 Tech stack

| Layer | Technology |
| --- | --- |
| Framework | TanStack Start v1 (React 19, SSR + server functions) |
| Build tool | Vite 7 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix primitives) |
| Data fetching | TanStack Query v5 |
| Routing | TanStack Router (file-based) |
| Backend | Supabase (Postgres, Auth, Row Level Security) |
| AI | Lovable AI Gateway → `google/gemini-3.6-flash` |
| PDF parsing | `pdfjs-dist` (runs in the browser) |
| Runtime | Edge / Cloudflare Workers compatible |

---

## 🚀 Getting started

```sh
git clone <your-repo-url>
cd ai-studymate
npm install          # or: bun install
cp .env.example .env # fill in your own values
npm run dev          # http://localhost:8080
```

Full instructions, environment variables and database setup:
**[docs/SETUP.md](docs/SETUP.md)**

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server on port 8080 |
| `npm run build` | Production build |
| `npm run build:dev` | Development-mode build (fast sanity check) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

---

## 📚 Documentation

| Document | Contents |
| --- | --- |
| [docs/SETUP.md](docs/SETUP.md) | Install, env vars, database migration, running locally |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, RAG pipeline, request flow, folder map |
| [docs/FEATURES.md](docs/FEATURES.md) | Every feature explained with how it works |
| [docs/DATABASE.md](docs/DATABASE.md) | Tables, columns, RLS policies, ER diagram |
| [docs/API.md](docs/API.md) | Server functions and their inputs/outputs |
| [docs/DESIGN.md](docs/DESIGN.md) | Design system: colours, typography, tokens |
| [docs/ROADMAP.md](docs/ROADMAP.md) | The 7 build phases and what ships next |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | How to deploy and go live |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Code style and contribution workflow |

---

## 🗂️ Project structure

```
src/
├── components/
│   ├── studymate/        # App-specific UI (sidebar, upload, cards)
│   └── ui/               # shadcn/ui primitives
├── hooks/useAuth.ts      # Session + user helper
├── integrations/supabase # Generated backend clients (do not edit)
├── lib/
│   ├── ai.server.ts      # AI gateway calls + retrieval helpers
│   ├── study.functions.ts# Server functions: summary, ask, MCQ, exam, cards
│   ├── pdf.ts            # PDF text extraction + chunking
│   └── documents.ts      # Upload + document queries
├── routes/
│   ├── __root.tsx        # Root layout + metadata
│   ├── auth.tsx          # Sign in / sign up
│   └── _authenticated/   # Everything behind login
│       ├── route.tsx     # App shell (sidebar, header, footer)
│       ├── index.tsx     # Dashboard
│       ├── notes.tsx     # My documents
│       ├── ask.tsx       # Ask AI
│       ├── quiz.tsx      # Quiz mode
│       ├── flashcards.tsx
│       ├── progress.tsx
│       └── documents.$id.tsx  # Study workspace (5 tabs)
└── styles.css            # Tailwind v4 theme tokens
supabase/migrations/      # SQL schema
```

---

## 🔒 Security

- Every table has **Row Level Security** — a user can only ever read or write
  their own rows (`auth.uid() = user_id`).
- AI keys live server-side only and are never exposed to the browser.
- Authentication supports email/password and Google sign-in.

---

## 📄 License

MIT — see [LICENSE](LICENSE).

## 👤 Author

**Deva Tejaswi Jupudi** — designed, built and deployed this project.
