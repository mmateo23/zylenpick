import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/features/auth/components/auth-form";
import { getCurrentUser } from "@/features/auth/services/auth-service";
import { getNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = getNoIndexMetadata({
  title: "Acceso a tu cuenta",
  description: "Área privada para iniciar sesión o crear una cuenta de usuario.",
});

type LoginPageProps = {
  searchParams?: {
    next?: string;
  };
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  const nextPath = searchParams?.next ?? "/cuenta";

  if (user) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-6 sm:px-6">
        <section className="app-shell-shadow rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
          <p className="text-sm font-medium text-[color:var(--brand)]">
            Sesion activa
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
            Ya has iniciado sesion
          </h1>
          <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
            Puedes volver al feed o entrar directamente en tu cuenta.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link
              href="/"
              className="rounded-[1.1rem] bg-[color:var(--surface-strong)] px-4 py-3 text-center text-sm font-semibold text-[color:var(--foreground)]"
            >
              Ir al feed
            </Link>
            <Link
              href="/cuenta"
              className="rounded-[1.1rem] bg-[color:var(--foreground)] px-4 py-3 text-center text-sm font-semibold text-white"
            >
              Ver cuenta
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-6 sm:px-6">
      <section className="app-shell-shadow rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
        <p className="text-sm font-medium text-[color:var(--brand)]">
          Acceso MVP
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
          Entra o crea tu cuenta
        </h1>
        <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
          Base inicial de autenticacion con email para clientes y merchants.
        </p>

        <div className="mt-6">
          <AuthForm nextPath={nextPath} />
        </div>
      </section>
    </main>
  );
}
