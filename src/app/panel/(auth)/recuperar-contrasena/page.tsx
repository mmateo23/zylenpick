import type { Metadata } from "next";
import Link from "next/link";

import { AdminPasswordResetRequestForm } from "@/components/admin/admin-password-reset-request-form";
import { getNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = getNoIndexMetadata({
  title: "Recuperar contraseña",
  description: "Recupera el acceso privado al panel de Pickyalo.",
});

export default function AdminPasswordResetPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-5 py-10 sm:px-6">
      <section className="glass-panel w-full rounded-[2rem] border border-[color:var(--border)] p-8 shadow-[var(--shadow)]">
        <p className="text-xs font-medium uppercase tracking-[0.26em] text-[color:var(--brand)]">
          Panel admin
        </p>
        <h1 className="mt-5 text-4xl font-semibold text-[color:var(--foreground)]">
          Recupera tu acceso
        </h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted-strong)]">
          Te enviaremos un enlace de un solo uso para crear una contraseña nueva.
        </p>
        <div className="mt-8">
          <AdminPasswordResetRequestForm />
        </div>
        <Link
          href="/panel/login"
          className="mt-5 block text-center text-sm font-semibold text-[color:var(--brand)]"
        >
          Volver al acceso
        </Link>
      </section>
    </main>
  );
}
