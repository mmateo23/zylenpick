import type { Metadata } from "next";

import { AdminPasswordUpdateForm } from "@/components/admin/admin-password-update-form";
import { getNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = getNoIndexMetadata({
  title: "Nueva contraseña",
  description: "Establece una contraseña nueva para el panel de Pickyalo.",
});

export default function AdminPasswordUpdatePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-5 py-10 sm:px-6">
      <section className="glass-panel w-full rounded-[2rem] border border-[color:var(--border)] p-8 shadow-[var(--shadow)]">
        <p className="text-xs font-medium uppercase tracking-[0.26em] text-[color:var(--brand)]">
          Enlace seguro
        </p>
        <h1 className="mt-5 text-4xl font-semibold text-[color:var(--foreground)]">
          Crea una contraseña nueva
        </h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted-strong)]">
          Utiliza al menos 10 caracteres y evita reutilizar una contraseña anterior.
        </p>
        <div className="mt-8">
          <AdminPasswordUpdateForm />
        </div>
      </section>
    </main>
  );
}
