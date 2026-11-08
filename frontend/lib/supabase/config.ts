// The Supabase project URL and publishable (anon) key. Both are public by
// design: Supabase protects data with its own rules, not by hiding these.
export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "");
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !key) return null;

  return { url, key };
}

// Only follow redirects to paths on this site, never to another origin
// ("//evil.example" and "/\evil.example" are protocol-relative URLs).
export function safeNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/analyze";
  }

  return value;
}
