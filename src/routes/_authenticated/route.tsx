import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";

import { AuroraBackground } from "@/components/studymate/AuroraBackground";
import { Sidebar } from "@/components/studymate/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  component: AppShell,
});

function AppShell() {
  const { session, loading, name } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="text-sm text-muted-foreground">Opening your study desk…</p>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AuroraBackground />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <header className="border-b border-hairline">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
              <p className="hidden text-sm sm:block">
                <span className="text-faint">{today} ·</span>
                <span className="text-foreground"> Good to see you</span>
              </p>
              <div className="flex items-center gap-3">
                <Link
                  to="/ask"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-card-foreground"
                >
                  Ask AI
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate({ to: "/auth" });
                  }}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-card-foreground"
                >
                  Sign out
                </button>
                <div className="flex items-center gap-2.5 rounded-full bg-surface py-1 pr-3 pl-1 ring-1 ring-hairline">
                  <div className="grid size-8 place-items-center rounded-full bg-accent/15 text-sm font-semibold text-accent ring-1 ring-accent/30">
                    {name.slice(0, 1).toUpperCase()}
                  </div>
                  <p className="max-w-32 truncate text-sm font-medium text-card-foreground">
                    {name}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-6xl px-6 py-8 sm:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
