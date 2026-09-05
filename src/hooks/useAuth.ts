import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const name =
    (session?.user.user_metadata?.["display_name"] as string | undefined) ??
    (session?.user.user_metadata?.["full_name"] as string | undefined) ??
    session?.user.email?.split("@")[0] ??
    "Student";

  return { session, loading, user: session?.user ?? null, name };
}
