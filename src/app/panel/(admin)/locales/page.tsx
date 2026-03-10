import Link from "next/link";

import { getAdminVenues } from "@/features/admin/services/venues-admin-service";

function statusClassName(isEnabled: boolean) {
  return isEnabled
    ? "bg-[color:var(--brand-soft)] text-[color:var(--accent)]"
    : "bg-white/8 text-white/58";
}

export default async function AdminVenuesPage() {
  const venues = await getAdminVenues();

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
            Panel admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
            Locales
          </h1>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted-strong)]">
            Gestión centralizada de los locales visibles en ZylenPick.
          </p>
        </div>

        <Link
          href="/panel/locales/nuevo"
          className="magnetic-button inline-flex rounded-full bg-[color:var(--brand)] px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)]"
        >
          Crear local
        </Link>
      </div>

      <section className="glass-panel overflow-hidden rounded-[1.8rem] border border-[color:var(--border)] shadow-[var(--soft-shadow)]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                <th className="px-5 py-4 font-medium">Nombre</th>
                <th className="px-5 py-4 font-medium">Ciudad</th>
                <th className="px-5 py-4 font-medium">Slug</th>
                <th className="px-5 py-4 font-medium">Teléfono</th>
                <th className="px-5 py-4 font-medium">Email</th>
                <th className="px-5 py-4 font-medium">Publicado</th>
                <th className="px-5 py-4 font-medium">Verificación</th>
                <th className="px-5 py-4 font-medium">Estado</th>
                <th className="px-5 py-4 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {venues.map((venue) => (
                <tr key={venue.id} className="text-sm text-[color:var(--foreground)]">
                  <td className="px-5 py-4 font-semibold">{venue.name}</td>
                  <td className="px-5 py-4 text-[color:var(--muted-strong)]">
                    {venue.cityName ?? "Sin ciudad"}
                  </td>
                  <td className="px-5 py-4 text-[color:var(--muted-strong)]">
                    {venue.slug}
                  </td>
                  <td className="px-5 py-4 text-[color:var(--muted-strong)]">
                    {venue.phone ?? "Sin teléfono"}
                  </td>
                  <td className="px-5 py-4 text-[color:var(--muted-strong)]">
                    {venue.email ?? "Sin email"}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusClassName(
                        venue.isPublished,
                      )}`}
                    >
                      {venue.isPublished ? "Publicado" : "Oculto"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusClassName(
                        venue.isVerified && venue.subscriptionActive,
                      )}`}
                    >
                      {venue.isVerified && venue.subscriptionActive
                        ? "Distintivo activo"
                        : "Sin distintivo"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusClassName(
                        venue.isActive,
                      )}`}
                    >
                      {venue.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/panel/locales/${venue.id}`}
                      className="text-sm font-semibold text-[color:var(--brand)]"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
