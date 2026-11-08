import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSupabaseConfig, safeNextPath } from "../../../lib/supabase/config";

// Where the confirmation email's link and Google sign-in land. Supabase
// sends either a one-time `code` (the default) or a `token_hash` with its
// `type`, or `error` when Google sign-in was cancelled or failed.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const next = safeNextPath(searchParams.get("next"));
  const failed = new URL("/login?error=confirm", request.url);
  const config = getSupabaseConfig();

  if (searchParams.has("error")) {
    return NextResponse.redirect(new URL("/login?error=oauth", request.url));
  }

  if (!config) return NextResponse.redirect(failed);

  const cookieStore = await cookies();

  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        );
      },
    },
  });

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  let error: unknown = new Error("No confirmation code in the link.");

  if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else if (tokenHash && type) {
    ({ error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash }));
  }

  return NextResponse.redirect(error ? failed : new URL(next, request.url));
}
