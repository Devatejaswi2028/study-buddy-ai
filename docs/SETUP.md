# Setup Guide

Everything you need to run AI StudyMate on your own machine.

## 1. Requirements

| Tool | Version |
| --- | --- |
| Node.js | 20 or newer (or [Bun](https://bun.sh) 1.1+) |
| npm / bun | bundled with the above |
| A Supabase project | free tier is enough |
| An AI API key | Lovable AI Gateway key, or any OpenAI-compatible key |

## 2. Clone and install

```sh
git clone <your-repo-url>
cd ai-studymate
npm install     # or bun install
```

## 3. Environment variables

Create a `.env` file in the project root:

```env
# Public — safe to expose in the browser
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-publishable-anon-key>
VITE_SUPABASE_PROJECT_ID=<your-project-ref>

# Private — server only, never commit
LOVABLE_API_KEY=<your-ai-gateway-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # only if you add admin features
```

Notes:

- `VITE_*` variables are injected into the client bundle. Only put publishable
  values there.
- `LOVABLE_API_KEY` is read inside server function handlers via
  `process.env["LOVABLE_API_KEY"]` and never reaches the browser.
- Types for these variables are declared in `src/vite-env.d.ts`.

## 4. Database

Run the SQL in `supabase/migrations/` against your Supabase project, in
filename order. Either paste it into the Supabase SQL editor, or use the CLI:

```sh
supabase link --project-ref <your-project-ref>
supabase db push
```

This creates six tables (`profiles`, `documents`, `document_chunks`,
`study_outputs`, `flashcards`, `quiz_attempts`), the grants, the Row Level
Security policies and the `handle_new_user` trigger that creates a profile row
on sign-up. See [DATABASE.md](DATABASE.md) for the full schema.

## 5. Authentication

In your Supabase project:

1. **Email** provider — enabled by default.
2. **Google** provider — add your Google OAuth client ID and secret, and add
   your app URL to the allowed redirect URLs.
3. Set **Site URL** to `http://localhost:8080` for local development, and your
   deployed URL for production.

## 6. Run

```sh
npm run dev
```

Open http://localhost:8080, create an account, and upload a PDF.

## 7. Verify the build

```sh
npm run build:dev   # fast type-safe build check
npm run build       # production build
```

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `AI is not configured for this project` | `LOVABLE_API_KEY` is missing from `.env` |
| Blank page after sign-in | Check the Supabase Site URL / redirect URLs |
| `permission denied for table ...` | Migration grants were not applied — re-run the SQL |
| PDF upload does nothing | The file must be a PDF under 25 MB |
| Type error on `import.meta.env` | Add the variable to `src/vite-env.d.ts` |
