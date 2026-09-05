import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AuroraBackground } from "@/components/studymate/AuroraBackground";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

const TITLE = "Sign in — AI StudyMate";
const DESCRIPTION =
  "Sign in to AI StudyMate to upload your notes and generate summaries, quizzes, flashcards and exam answers.";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/" });
  }, [loading, session, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { display_name: displayName || email.split("@")[0] },
        },
      });
      if (error) setError(error.message);
      else setNotice("Account created. If email confirmation is on, check your inbox.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setBusy(false);
  }

  async function google() {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in failed. Try again.");
      return;
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
      <AuroraBackground />
      <div className="w-full max-w-sm rounded-2xl bg-surface-strong p-6 ring-1 ring-hairline">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
            <span className="font-display text-lg font-semibold text-primary">A</span>
          </div>
          <div className="leading-tight">
            <p className="font-display text-[15px] font-semibold text-card-foreground">
              AI StudyMate
            </p>
            <p className="text-[11px] text-faint">Your PDFs, turned into study material</p>
          </div>
        </div>

        <h1 className="mt-6 font-display text-2xl font-semibold text-card-foreground">
          {mode === "signin" ? "Welcome back" : "Create your desk"}
        </h1>

        <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
          {mode === "signup" && (
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="rounded-lg bg-background px-3 py-2 text-sm text-foreground ring-1 ring-input outline-none placeholder:text-faint focus:ring-primary/50"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@college.edu"
            className="rounded-lg bg-background px-3 py-2 text-sm text-foreground ring-1 ring-input outline-none placeholder:text-faint focus:ring-primary/50"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="rounded-lg bg-background px-3 py-2 text-sm text-foreground ring-1 ring-input outline-none placeholder:text-faint focus:ring-primary/50"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-px disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={google}
          className="mt-3 w-full rounded-lg bg-surface px-4 py-2 text-sm font-medium text-card-foreground ring-1 ring-border transition-colors hover:bg-surface-strong"
        >
          Continue with Google
        </button>

        {error && <p className="mt-3 text-[12px] text-destructive">{error}</p>}
        {notice && <p className="mt-3 text-[12px] text-primary">{notice}</p>}

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-center text-[12px] text-muted-foreground hover:text-card-foreground"
        >
          {mode === "signin"
            ? "New here? Create an account"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
