import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminUnauthorizedState } from "@/components/admin/admin-unauthorized-state";
import { requireAdminSession } from "@/features/admin/services/admin-auth";

export default async function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const sessionState = await requireAdminSession();

  if (!sessionState.configured) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-5 py-10 sm:px-6">
        <section className="glass-panel w-full rounded-[2rem] border border-[color:var(--border)] p-8 shadow-[var(--shadow)]">
          <p className="text-lg font-semibold text-[color:var(--foreground)]">
            Supabase no está configurado.
          </p>
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted-strong)]">
            El panel admin necesita autenticación y acceso a Supabase para
            funcionar.
          </p>
        </section>
      </main>
    );
  }

  if (!sessionState.authorized) {
    return <AdminUnauthorizedState email={sessionState.email} />;
  }

  return <AdminShell email={sessionState.email}>{children}</AdminShell>;
}
