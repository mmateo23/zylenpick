"use client";

import { FormEvent, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AdminAuthForm() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);

  const handleGoogleLogin = async () => {
    setFeedback(null);
    setIsSubmittingGoogle(true);

    const supabase = createSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/panel/auth/callback?next=/panel`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      setFeedback("No hemos podido iniciar sesión con Google.");
      setIsSubmittingGoogle(false);
    }
  };

  const handleEmailLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setIsSubmittingEmail(true);

    const supabase = createSupabaseBrowserClient();
    const emailRedirectTo = `${window.location.origin}/panel/auth/callback?next=/panel`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo,
      },
    });

    if (error) {
      setFeedback("No hemos podido enviar el enlace de acceso.");
      setIsSubmittingEmail(false);
      return;
    }

    setFeedback(
      "Te hemos enviado un enlace de acceso al correo indicado. Ábrelo desde este dispositivo para entrar en el panel.",
    );
    setIsSubmittingEmail(false);
  };

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isSubmittingGoogle}
        className="magnetic-button inline-flex w-full items-center justify-center rounded-full bg-[color:var(--brand)] px-5 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmittingGoogle ? "Conectando con Google..." : "Entrar con Google"}
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">
          o
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form className="space-y-4" onSubmit={handleEmailLogin}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@email.com"
            required
            className="dark-form-field w-full rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-3.5 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--brand)]"
          />
        </label>

        {feedback ? (
          <div className="rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-3 text-sm leading-6 text-[color:var(--muted-strong)]">
            {feedback}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmittingEmail}
          className="magnetic-button inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-semibold text-[color:var(--foreground)] shadow-[var(--card-shadow)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmittingEmail ? "Enviando enlace..." : "Entrar con email"}
        </button>
      </form>
    </div>
  );
}
