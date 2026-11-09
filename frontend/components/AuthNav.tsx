"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { getBrowserSupabase } from "../lib/supabase/client";
import { getSupabaseConfig } from "../lib/supabase/config";

// The account part of the header. It reads the session in the browser, so
// every page can stay static.
export default function AuthNav({ current }: { current: string }) {
  const quiet =
    "font-medium underline-offset-[6px] decoration-accent decoration-[3px] hover:underline disabled:opacity-60";
  const key = "send min-h-10 px-4 py-2 text-base";

  // undefined while the session is still being read.
  const [user, setUser] = useState<User | null | undefined>(
    getSupabaseConfig() ? undefined : null,
  );
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;

    // The first event (INITIAL_SESSION) reads the session saved in this
    // browser, with no network call. That's enough to pick the header
    // buttons: /analyze and the backend each verify the sign-in properly.
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
          <li className="hidden sm:block">
            <Link href="/analyze" className={key}>
              upload a chat
            </Link>
          </li>
        )}
        <li>
          <Link href="/saved" aria-current={current === "saved" ? "page" : undefined} className={`${quiet} aria-[current=page]:underline`}>
            saved
          </Link>
        </li>
        <li>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className={quiet}
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
            className={quiet}
          >
            log in
          </Link>
        </li>
      )}
      {current !== "register" && (
        <li>
          <Link href="/register" className={key}>
            sign up
          </Link>
        </li>
      )}
    </>
  );
}
