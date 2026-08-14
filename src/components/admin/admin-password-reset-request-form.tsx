"use client";

import { FormEvent, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AdminPasswordResetRequestForm() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    const supabase = createSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/panel/auth/callback?next=/panel/nueva-contrasena`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    setIsSubmitting(false);
    setFeedback(
      error
        ? "No hemos podido enviar el correo. Inténtalo de nuevo dentro de unos minutos."
        : "Si el correo está registrado, recibirás un enlace para crear una contraseña nueva.",
    );
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-[color:var(--foreground)]">
          Email autorizado
        </span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="tu@email.com"
          required
          className="dark-form-field w-full rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-3.5 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--brand)]"
        />
      </label>

      {feedback ? (
        <p
          role="status"
          className="rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-3 text-sm leading-6 text-[color:var(--muted-strong)]"
        >
          {feedback}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--brand)] px-5 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Enviando..." : "Enviar enlace seguro"}
      </button>
    </form>
  );
}
