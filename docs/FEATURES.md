# Features

Every feature, what the student sees, and how it works underneath.

---

## 📄 PDF Upload

**Where:** Dashboard (`/`) and My Notes (`/notes`)

Drag a file onto the upload zone or click to browse. Only PDFs are accepted,
up to 25 MB. The file is read in the browser, its text extracted page by page,
split into overlapping chunks and saved. A progress state shows extracting →
saving → ready.

**Code:** `src/components/studymate/UploadZone.tsx`, `src/lib/pdf.ts`,
`src/lib/documents.ts`

---

## 📝 Smart Summary

**Where:** Study workspace → Summary tab

Produces a tight set of study notes covering the whole document: main ideas,
sub-points and anything an examiner is likely to ask. Generated once and cached
in `study_outputs`, so returning to the tab is instant.

**Server function:** `generateText({ documentId, kind: "summary" })`

---

## 💬 Ask AI

**Where:** `/ask` and the study workspace

Ask a question in plain English. The app finds the most relevant chunks of your
document and answers only from that material, so the answer stays grounded in
your syllabus rather than the model's general knowledge.

**Server function:** `askDocument({ documentId, question })`

---

## 🧠 Explain Simply

**Where:** Study workspace → Explain tab

Enter a concept you're stuck on. The AI re-explains it in beginner language
with an analogy and a worked example, using your document as the source.

**Server function:** `generateText({ documentId, kind: "explain", topic })`

---

## ❓ MCQ Generator

**Where:** Study workspace → MCQ tab

Generates multiple-choice questions with four options each, the correct answer
marked and a one-line justification. Useful for self-testing before an exam.

**Server function:** `generateMcqs({ documentId, count })` → `Mcq[]`

---

## ✍️ Exam Answers (Exam Mode)

**Where:** Study workspace → Exam Mode tab

The standout feature. Choose:

- **Subject** — free text, e.g. "Responsible AI"
- **Exam** — Mid-term, End-term, Internal or Practice
- **Marks** — 2, 5, 6 or 10
- **Question** — the exact question you expect

The AI writes an answer sized for the mark weight, in the structure examiners
reward:

```
Definition → Explanation → Key Points → Example → Conclusion
```

**Server function:** `generateExamAnswer({ documentId, subject, exam, marks, question })`

---

## 🃏 Flashcards

**Where:** `/flashcards` and the study workspace

Generates front/back revision cards from a document and stores them. Click a
card to flip it; step through the deck to revise.

**Server function:** `generateFlashcards({ documentId, count })`
**Table:** `flashcards`

---

## 📚 Revision Notes

**Where:** Study workspace → Revision tab

A last-minute revision sheet: numbered key points, definitions and a keyword
list — the things worth reading on the morning of the exam.

**Server function:** `generateText({ documentId, kind: "revision" })`

---

## 🎯 Quiz Mode

**Where:** `/quiz`

Pick a document, generate a quiz, answer one question at a time with instant
right/wrong feedback, then see your final score. Each finished attempt is saved
to `quiz_attempts` with the document title as the topic (or "General" when no
document is selected).

---

## 📊 Progress

**Where:** `/progress`

Shows total attempts, average score, best score and a history of every quiz you
have taken, grouped by topic — so you can see which subjects need more work.

**Table:** `quiz_attempts`

---

## 🔐 Accounts

Email/password and Google sign-in. A `profiles` row is created automatically on
sign-up by the `handle_new_user` trigger. Every page except `/auth` requires a
session, and all data is scoped to the signed-in user by Row Level Security.
