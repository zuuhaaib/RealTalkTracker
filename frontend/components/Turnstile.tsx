"use client";

import { useEffect, useRef } from "react";

// Cloudflare Turnstile, the human check Supabase verifies on sign-up and
// log-in when CAPTCHA protection is on. Hidden when no site key is set.

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);

  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile missing"));
    script.onerror = () => {
      scriptPromise = null;
      script.remove();
      reject(new Error("turnstile failed to load"));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function getTurnstileSiteKey() {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || null;
}

export default function Turnstile({
  siteKey,
  resetSignal,
  onToken,
  onUnavailable,
}: {
  siteKey: string;
  /** Change this number to get a fresh check (tokens are single-use). */
  resetSignal: number;
  onToken: (token: string | null) => void;
  onUnavailable: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);

  // Keep the latest callbacks without re-rendering the widget.
  const onTokenRef = useRef(onToken);
  const onUnavailableRef = useRef(onUnavailable);
  useEffect(() => {
    onTokenRef.current = onToken;
    onUnavailableRef.current = onUnavailable;
  });

  useEffect(() => {
    let cancelled = false;

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !containerRef.current) return;

        widgetRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "light",
          size: "flexible",
          callback: (token: string) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(null),
          "timeout-callback": () => onTokenRef.current(null),
          "error-callback": () => {
            onTokenRef.current(null);
            onUnavailableRef.current();
          },
        });
      })
      .catch(() => {
        if (!cancelled) onUnavailableRef.current();
      });

    return () => {
      cancelled = true;
      if (widgetRef.current && window.turnstile) {
        window.turnstile.remove(widgetRef.current);
      }
      widgetRef.current = null;
    };
  }, [siteKey]);

  useEffect(() => {
    if (resetSignal > 0 && widgetRef.current && window.turnstile) {
      window.turnstile.reset(widgetRef.current);
    }
  }, [resetSignal]);

  return <div ref={containerRef} className="min-h-[65px]" />;
}
