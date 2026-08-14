"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AdminPasswordUpdateForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    void supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
    });
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (password.length < 10) {
      setFeedback("La contraseña debe tener al menos 10 caracteres.");
      return;
    }

    if (password !== confirmation) {
      setFeedback("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setFeedback("El enlace no es válido o ha caducado. Solicita uno nuevo.");
      setIsSubmitting(false);
      return;
    }

    router.replace("/panel");
    router.refresh();
  };

  if (hasSession === false) {
    return (
      <div className="space-y-4">
        <p className="rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-3 text-sm leading-6 text-[color:var(--muted-strong)]">
          El enlace no es válido o ha caducado. Solicita un correo nuevo para continuar.
        </p>
        <button
          type="button"
          onClick={() => router.replace("/panel/recuperar-contrasena")}
          className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--brand)] px-5 py-3.5 text-sm font-semibold text-white"
        >
          Solicitar otro enlace
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-[color:var(--foreground)]">
          Nueva contraseña
        </span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={10}
          required
          className="dark-form-field w-full rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-3.5 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--brand)]"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-[color:var(--foreground)]">
          Repite la contraseña
        </span>
        <input
          type="password"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          autoComplete="new-password"
          minLength={10}
          required
          className="dark-form-field w-full rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-3.5 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--brand)]"
        />
      </label>

      {feedback ? (
        <p role="alert" className="rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-3 text-sm leading-6 text-[color:var(--muted-strong)]">
          {feedback}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || hasSession !== true}
        className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--brand)] px-5 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Guardando..." : "Guardar contraseña"}
      </button>
    </form>
  );
}
