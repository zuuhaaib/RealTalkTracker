"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { getBrowserSupabase } from "../lib/supabase/client";
import { getSupabaseConfig } from "../lib/supabase/config";

// The account part of the header. It reads the session in the browser, so
// every page can stay static.
export default function AuthNav({ current }: { current: string }) {
  // undefined while the session is still being read.
  const [user, setUser] = useState<User | null | undefined>(
    getSupabaseConfig() ? undefined : null,
  );
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    const supabase = getBrowserSupabase();
    if (!supabase || signingOut) return;

    setSigningOut(true);
    await supabase.auth.signOut();
    // A full page load clears every page's signed-in state at once.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/");
  }

  if (user === undefined) {
    // Same height as the buttons, so the header doesn't jump.
    return <li aria-hidden="true" className="h-10 w-24" />;
  }

  if (user) {
    return (
      <>
        {current !== "analyze" && (
          <li>
            <Link href="/analyze" className="btn-primary min-h-10 px-4 py-2 text-sm">
              upload a chat
            </Link>
          </li>
        )}
        <li>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="rounded-sm text-muted transition-colors hover:text-ink disabled:opacity-60"
          >
            {signingOut ? "logging out…" : "log out"}
          </button>
        </li>
      </>
    );
  }

  return (
    <>
      {current !== "login" && (
        <li>
          <Link
            href="/login"
            className="rounded-sm text-muted transition-colors hover:text-ink"
          >
            log in
          </Link>
        </li>
      )}
      {current !== "register" && (
        <li>
          <Link href="/register" className="btn-primary min-h-10 px-4 py-2 text-sm">
            sign up
          </Link>
        </li>
      )}
    </>
  );
}
