import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSupabaseConfig, safeNextPath } from "./lib/supabase/config";

const AUTH_PAGES = new Set(["/login", "/register"]);

// Keeps the Supabase session fresh, sends signed-out visitors from
// /analyze and /saved to the login page, and sends signed-in visitors away from
// the login and register pages.
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAuthPage = AUTH_PAGES.has(pathname);
  const config = getSupabaseConfig();

  const toLogin = () => {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return url;
  };

  // Without Supabase settings nobody can sign in, so the login page
  // explains that instead of the analyze page failing on upload.
  if (!config) {
    return isAuthPage ? NextResponse.next() : NextResponse.redirect(toLogin());
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // getUser() asks Supabase, so a signed-out or revoked session can't
  // pass on a stale cookie alone.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectTo = (url: URL) => {
    const redirect = NextResponse.redirect(url);
    // Keep any refreshed session cookies on the redirect too.
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  };

  if (!user && !isAuthPage) {
    return redirectTo(toLogin());
  }

  if (user && isAuthPage) {
    const next = safeNextPath(request.nextUrl.searchParams.get("next"));
    return redirectTo(new URL(next, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/analyze", "/saved", "/login", "/register"],
};
