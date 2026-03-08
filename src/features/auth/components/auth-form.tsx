"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthMode = "login" | "register";

type AuthFormProps = {
  nextPath: string;
};

export function AuthForm({ nextPath }: AuthFormProps) {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "merchant">("customer");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    const supabase = createSupabaseBrowserClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setFeedback("No se pudo iniciar sesion. Revisa tu email y contrasena.");
        setIsSubmitting(false);
        return;
      }

      router.replace(nextPath);
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (error) {
      setFeedback("No se pudo crear la cuenta. Revisa los datos e intentalo otra vez.");
      setIsSubmitting(false);
      return;
    }

    if (!data.session) {
      setFeedback(
        "Cuenta creada. Si tienes confirmacion por email activada, revisa tu correo antes de entrar.",
      );
      setIsSubmitting(false);
      return;
    }

    router.replace(nextPath);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 rounded-[1.4rem] bg-[color:var(--surface-strong)] p-2">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-[1rem] px-4 py-3 text-sm font-semibold transition ${
            mode === "login"
              ? "bg-[color:var(--foreground)] text-white"
              : "text-[color:var(--muted)]"
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`rounded-[1rem] px-4 py-3 text-sm font-semibold transition ${
            mode === "register"
              ? "bg-[color:var(--foreground)] text-white"
              : "text-[color:var(--muted)]"
          }`}
        >
          Crear cuenta
        </button>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === "register" ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Nombre
            </span>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Como quieres aparecer"
              className="w-full rounded-[1.2rem] border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand)]"
            />
          </label>
        ) : null}

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
            className="w-full rounded-[1.2rem] border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand)]"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Contrasena
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimo 6 caracteres"
            required
            minLength={6}
            className="w-full rounded-[1.2rem] border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand)]"
          />
        </label>

        {mode === "register" ? (
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-[color:var(--foreground)]">
              Tipo de cuenta
            </legend>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("customer")}
                className={`rounded-[1rem] border px-4 py-3 text-sm font-semibold transition ${
                  role === "customer"
                    ? "border-[color:var(--brand)] bg-[color:var(--surface-strong)] text-[color:var(--foreground)]"
                    : "border-[color:var(--border)] bg-white text-[color:var(--muted)]"
                }`}
              >
                Cliente
              </button>
              <button
                type="button"
                onClick={() => setRole("merchant")}
                className={`rounded-[1rem] border px-4 py-3 text-sm font-semibold transition ${
                  role === "merchant"
                    ? "border-[color:var(--brand)] bg-[color:var(--surface-strong)] text-[color:var(--foreground)]"
                    : "border-[color:var(--border)] bg-white text-[color:var(--muted)]"
                }`}
              >
                Merchant
              </button>
            </div>
          </fieldset>
        ) : null}

        {feedback ? (
          <div className="rounded-[1.2rem] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-[color:var(--foreground)]">
            {feedback}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-[1.2rem] bg-[color:var(--foreground)] px-4 py-4 text-sm font-semibold text-white transition disabled:opacity-60"
        >
          {isSubmitting
            ? "Procesando..."
            : mode === "login"
              ? "Entrar con email"
              : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}
