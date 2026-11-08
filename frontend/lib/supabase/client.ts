import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseConfig } from "./config";

let client: SupabaseClient | null = null;

// One browser client for the whole app. Returns null when sign-in hasn't
// been configured, so pages can say so instead of crashing, and during
// server rendering, so call it from effects and event handlers only.
export function getBrowserSupabase() {
  const config = getSupabaseConfig();

  if (!config || typeof window === "undefined") return null;

  client ??= createBrowserClient(config.url, config.key);

  return client;
}
