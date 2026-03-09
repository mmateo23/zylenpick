import { getAdminDashboardSummary } from "@/features/admin/services/dashboard-service";

const adminStats = [
  {
    key: "venues",
    label: "Locales",
    description: "Locales cargados actualmente en el catálogo.",
  },
  {
    key: "menuItems",
    label: "Platos",
    description: "Platos visibles o preparados para mostrar en la app.",
  },
  {
    key: "orders",
    label: "Pedidos",
    description: "Base preparada. Aún no persistidos en Supabase.",
  },
  {
    key: "requests",
    label: "Solicitudes",
    description: "Llegan por email. Aún no almacenadas en base de datos.",
  },
] as const;

export default async function AdminDashboardPage() {
  const summary = await getAdminDashboardSummary();

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminStats.map((stat) => {
          const value =
            stat.key === "venues"
              ? summary.venuesCount
              : stat.key === "menuItems"
                ? summary.menuItemsCount
                : null;

          return (
            <article
              key={stat.key}
              className="glass-panel rounded-[1.8rem] border border-[color:var(--border)] p-5 shadow-[var(--soft-shadow)]"
            >
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
                {stat.label}
              </p>
              <p className="mt-4 text-4xl font-semibold text-[color:var(--foreground)]">
                {value ?? "—"}
              </p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--muted-strong)]">
                {stat.description}
              </p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="glass-panel rounded-[1.8rem] border border-[color:var(--border)] p-6 shadow-[var(--soft-shadow)]">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
            Pedidos recientes
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-[color:var(--foreground)]">
            Pendientes de conectar
          </h2>
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted-strong)]">
            En esta fase el panel aún no lee pedidos reales desde Supabase.
            Queda preparado para conectar la persistencia del flujo de checkout
            en la siguiente iteración.
          </p>
        </section>

        <section className="glass-panel rounded-[1.8rem] border border-[color:var(--border)] p-6 shadow-[var(--soft-shadow)]">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
            Solicitudes de alta
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-[color:var(--foreground)]">
            Gestión centralizada
          </h2>
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted-strong)]">
            Las solicitudes de “Únete a ZylenPick” llegan por correo. El panel
            queda listo para añadir esta bandeja cuando exista almacenamiento
            persistente de solicitudes.
          </p>
        </section>
      </div>
    </section>
  );
}
