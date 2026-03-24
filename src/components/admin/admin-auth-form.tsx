"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AdminAuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailPasswordLogin = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setFeedback("No hemos podido iniciar sesión con ese email y contraseña.");
      setIsSubmitting(false);
      return;
    }

    router.push("/panel");
    router.refresh();
  };

  return (
    <form className="space-y-4" onSubmit={handleEmailPasswordLogin}>
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

      <label className="block space-y-2">
        <span className="text-sm font-medium text-[color:var(--foreground)]">
          Contraseña
        </span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Tu contraseña"
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
        disabled={isSubmitting}
        className="magnetic-button inline-flex w-full items-center justify-center rounded-full bg-[color:var(--brand)] px-5 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Entrando..." : "Entrar al panel"}
      </button>
    </form>
  );
}
