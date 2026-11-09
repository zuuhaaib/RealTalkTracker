"use client";

import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import type { FormEvent } from "react";
import { LoaderCircle, MailCheck } from "lucide-react";

import { getBrowserSupabase } from "../lib/supabase/client";
import GoogleButton from "./GoogleButton";
import Turnstile, { getTurnstileSiteKey } from "./Turnstile";
import { getSupabaseConfig, safeNextPath } from "../lib/supabase/config";

type Mode = "login" | "register";

type FieldErrors = {
  email?: string;
  password?: string;
  confirm?: string;
};

const MIN_PASSWORD = 8;

// Messages for the ?error= values other pages send here.
const notices: Record<string, string> = {
  confirm:
    "that link didn’t sign you in automatically. if you just confirmed your email, log in below.",
  expired: "your session ended. log in again to keep analyzing.",
  oauth: "Google sign-in didn’t finish. try again, or use your email instead.",
};

function friendlyAuthError(message: string, mode: Mode) {
  const text = message.toLowerCase();

  if (text.includes("captcha")) {
    return "the quick human check didn’t go through. try it again.";
  }
  if (text.includes("invalid login credentials")) {
    return "that email and password don’t match. try again.";
  }
  if (text.includes("email not confirmed")) {
    return "confirm your email first. the link is in your inbox.";
  }
  if (text.includes("already registered") || text.includes("already exists")) {
    return "there’s already an account with this email. log in instead.";
  }
  if (text.includes("rate limit") || text.includes("too many")) {
    return "too many attempts right now. wait a minute and try again.";
  }
  if (text.includes("fetch") || text.includes("network")) {
    return "couldn’t reach the sign-in service. check your connection and try again.";
  }
  if (text.includes("password")) {
    return message;
  }

  return mode === "login"
    ? "couldn’t log you in. try again in a moment."
    : "couldn’t create your account. try again in a moment.";
}

// The query string doesn't change while this page is open.
function subscribeToNothing() {
  return () => {};
}

export default function AuthForm({ mode }: { mode: Mode }) {
  const configured = getSupabaseConfig() !== null;
  const isRegister = mode === "register";
  const captchaSiteKey = getTurnstileSiteKey();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);
  const [captchaUnavailable, setCaptchaUnavailable] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  // Read the query string in the browser only, so the page itself stays
  // static (the server snapshot is an empty query).
  const search = useSyncExternalStore(
    subscribeToNothing,
    () => window.location.search,
    () => "",
  );
  const params = new URLSearchParams(search);
  const next = safeNextPath(params.get("next"));
  const notice = notices[params.get("error") ?? ""] ?? "";

  const otherPage = `${isRegister ? "/login" : "/register"}${
    next === "/analyze" ? "" : `?next=${encodeURIComponent(next)}`
  }`;

  function validate(): FieldErrors {
    const errors: FieldErrors = {};

    if (!email.trim()) {
      errors.email = "enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "that doesn’t look like an email address.";
    }

    if (!password) {
      errors.password = "enter a password.";
    } else if (isRegister && password.length < MIN_PASSWORD) {
      errors.password = `use at least ${MIN_PASSWORD} characters.`;
    }

    if (isRegister && password && confirm !== password) {
      errors.confirm = "the passwords don’t match.";
    }

    return errors;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getBrowserSupabase();
    if (submitting || !supabase) return;

    const errors = validate();
    setFieldErrors(errors);
    setFormError("");

    if (errors.email) return emailRef.current?.focus();
    if (errors.password) return passwordRef.current?.focus();
    if (errors.confirm) return confirmRef.current?.focus();

    if (captchaSiteKey && !captchaToken) {
      setFormError(
        captchaUnavailable
          ? "the human check couldn’t load. refresh the page, or turn off anything blocking challenges.cloudflare.com."
          : "give the quick human check a second to finish, then try again.",
      );
      return;
    }

    setSubmitting(true);

    // Each check token works once, so every attempt uses up this one.
    const captcha = captchaToken ?? undefined;

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}`,
            captchaToken: captcha,
          },
        });

        if (error) throw error;

        // With email confirmation off, Supabase signs the user in at once.
        if (data.session) {
          window.location.assign(next);
          return;
        }

        // With confirmation on, an existing email comes back with no
        // identities instead of an error.
        if (data.user && data.user.identities?.length === 0) {
          setFormError(friendlyAuthError("already registered", mode));
          return;
        }

        setSentTo(email.trim());
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
        options: { captchaToken: captcha },
      });

      if (error) throw error;

      // A full navigation, so the server sees the new session cookie.
      window.location.assign(next);
    } catch (error) {
      setFormError(
        friendlyAuthError(error instanceof Error ? error.message : "", mode),
      );
    } finally {
      setSubmitting(false);

      if (captchaSiteKey) {
        setCaptchaToken(null);
        setCaptchaReset((count) => count + 1);
      }
    }
  }

  if (sentTo) {
    return (
      <div role="status" className="motion-safe:animate-[pop-in_400ms_var(--ease-out)]">
        <MailCheck size={32} className="text-accent-text" aria-hidden="true" />
        <h2 className="say mt-4 text-[clamp(2rem,1.5rem+1.6vw,3rem)]">
          check your inbox.
        </h2>
        <p className="mt-3 text-lg leading-relaxed">
          we sent a confirmation link to{" "}
          <span className="font-medium text-ink [overflow-wrap:anywhere]">{sentTo}</span>.
          open it on this device to finish signing up.
        </p>
        <p className="mt-6 text-lg">
          already confirmed?{" "}
          <Link href={otherPage} className="text-link">
            log in
          </Link>
        </p>
      </div>
    );
  }

  const inputClass =
    "mt-2 block min-h-14 w-full rounded-2xl border-2 bg-white px-4 py-3 text-lg text-ink placeholder:text-muted transition-colors focus:border-ink focus:outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent-text aria-[invalid=true]:border-danger";

  return (
    <div>
      {!configured && (
        <p role="alert" className="mb-6 rounded-2xl bg-danger/10 px-4 py-3 text-lg font-medium text-danger">
          sign-in isn’t set up on this site yet, so accounts can’t be created
          or used right now.
        </p>
      )}

      {notice && (
        <p role="status" className="mb-6 rounded-2xl bg-accent/20 px-4 py-3 text-lg">
          {notice}
        </p>
      )}

      {configured && <GoogleButton next={next} onError={setFormError} />}

      <form noValidate onSubmit={onSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="text-lg font-medium">
            email
          </label>
          <input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            disabled={!configured}
            className={`${inputClass} ${fieldErrors.email ? "border-danger" : "border-ink/15"}`}
          />
          {fieldErrors.email && (
            <p id="email-error" className="mt-2 text-base font-medium text-danger">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="password" className="text-lg font-medium">
              password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-pressed={showPassword}
              aria-controls={isRegister ? "password confirm" : "password"}
              className="font-medium underline decoration-2 underline-offset-4"
            >
              {showPassword ? "hide" : "show"}
            </button>
          </div>
          <input
            ref={passwordRef}
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete={isRegister ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              [isRegister ? "password-hint" : "", fieldErrors.password ? "password-error" : ""]
                .filter(Boolean)
                .join(" ") || undefined
            }
            disabled={!configured}
            className={`${inputClass} ${fieldErrors.password ? "border-danger" : "border-ink/15"}`}
          />
          {isRegister && !fieldErrors.password && (
            <p id="password-hint" className="mt-2 text-base">
              at least {MIN_PASSWORD} characters.
            </p>
          )}
          {fieldErrors.password && (
            <p id="password-error" className="mt-2 text-base font-medium text-danger">
              {fieldErrors.password}
            </p>
          )}
        </div>

        {isRegister && (
          <div>
            <label htmlFor="confirm" className="text-lg font-medium">
              confirm password
            </label>
            <input
              ref={confirmRef}
              id="confirm"
              name="confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              aria-invalid={Boolean(fieldErrors.confirm)}
              aria-describedby={fieldErrors.confirm ? "confirm-error" : undefined}
              disabled={!configured}
              className={`${inputClass} ${fieldErrors.confirm ? "border-danger" : "border-ink/15"}`}
            />
            {fieldErrors.confirm && (
              <p id="confirm-error" className="mt-2 text-base font-medium text-danger">
                {fieldErrors.confirm}
              </p>
            )}
          </div>
        )}

        {configured && captchaSiteKey && (
          <Turnstile
            siteKey={captchaSiteKey}
            resetSignal={captchaReset}
            onToken={(token) => {
              setCaptchaToken(token);
              if (token) setCaptchaUnavailable(false);
            }}
            onUnavailable={() => setCaptchaUnavailable(true)}
          />
        )}

        {formError && (
          <p role="alert" className="rounded-2xl bg-danger/10 px-4 py-3 text-lg font-medium text-danger motion-safe:animate-[pop-in_300ms_var(--ease-out)]">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !configured}
          className="send min-h-14 w-full text-lg"
        >
          {submitting && (
            <LoaderCircle className="motion-safe:animate-spin" size={18} aria-hidden="true" />
          )}
          {submitting
            ? isRegister
              ? "creating your account…"
              : "logging in…"
            : isRegister
              ? "create account"
              : "log in"}
        </button>
      </form>

      {isRegister && (
        <p className="mt-5 text-center text-base leading-relaxed">
          by creating an account, you agree to the{" "}
          <Link href="/terms" className="text-link">
            terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-link">
            privacy policy
          </Link>
          .
        </p>
      )}

      <p className="mt-6 text-center text-lg">
        {isRegister ? "already have an account?" : "new here?"}{" "}
        <Link href={otherPage} className="text-link">
          {isRegister ? "log in" : "create an account"}
        </Link>
      </p>
    </div>
  );
}
