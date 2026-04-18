import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminAuthForm } from "@/components/admin/admin-auth-form";
import { AdminUnauthorizedState } from "@/components/admin/admin-unauthorized-state";
import { getAdminSessionState } from "@/features/admin/services/admin-auth";
import { getNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = getNoIndexMetadata({
  title: "Acceso al panel",
  description: "Área privada para acceder al panel de administración.",
});

export default async function AdminLoginPage() {
  const sessionState = await getAdminSessionState();

  if (!sessionState.configured) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-5 py-10 sm:px-6">
        <section className="glass-panel w-full rounded-[2rem] border border-[color:var(--border)] p-8 shadow-[var(--shadow)]">
          <p className="text-xs font-medium uppercase tracking-[0.26em] text-[color:var(--brand)]">
            Panel admin
          </p>
          <h1 className="mt-5 text-4xl font-semibold text-[color:var(--foreground)]">
            Supabase no está configurado
          </h1>
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted-strong)]">
            El panel necesita autenticación y acceso a datos para poder arrancar.
          </p>
        </section>
      </main>
    );
  }

  if (sessionState.user && sessionState.authorized) {
    redirect("/panel");
  }

  if (sessionState.user && !sessionState.authorized) {
    return <AdminUnauthorizedState email={sessionState.email} />;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-5 py-10 sm:px-6">
      <section className="glass-panel w-full rounded-[2rem] border border-[color:var(--border)] p-8 shadow-[var(--shadow)]">
        <p className="text-xs font-medium uppercase tracking-[0.26em] text-[color:var(--brand)]">
          Panel admin
        </p>
        <h1 className="mt-5 text-4xl font-semibold text-[color:var(--foreground)]">
          Accede al control de ZylenPick
        </h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted-strong)]">
          Acceso privado para gestionar locales, platos, pedidos y solicitudes
          durante el MVP.
        </p>

        <div className="mt-8">
          <AdminAuthForm />
        </div>
      </section>
    </main>
  );
}
