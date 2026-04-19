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
            Gestion centralizada de los locales visibles en ZylenPick.
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
        <div className="divide-y divide-white/8">
          {venues.map((venue) => (
            <article
              key={venue.id}
              className="grid gap-4 px-5 py-5 text-sm text-[color:var(--foreground)] md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] md:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-base font-semibold">{venue.name}</h2>
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusClassName(
                      venue.isPublished,
                    )}`}
                  >
                    {venue.isPublished ? "Publicado" : "Oculto"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[color:var(--muted-strong)]">
                  {venue.cityName ?? "Sin ciudad"}
                </p>
                <p className="mt-1 break-all text-xs text-[color:var(--muted)]">
                  /{venue.slug}
                </p>
              </div>

              <div className="grid gap-2 text-[color:var(--muted-strong)] sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                <p className="min-w-0 truncate">
                  <span className="text-[color:var(--muted)]">Tel.</span>{" "}
                  {venue.phone ?? "Sin telefono"}
                </p>
                <p className="min-w-0 truncate">
                  <span className="text-[color:var(--muted)]">Email</span>{" "}
                  {venue.email ?? "Sin email"}
                </p>
                <div className="flex flex-wrap gap-2 sm:col-span-2 md:col-span-1 lg:col-span-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusClassName(
                      venue.isActive,
                    )}`}
                  >
                    {venue.isActive ? "Activo" : "Inactivo"}
                  </span>
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusClassName(
                      venue.isVerified && venue.subscriptionActive,
                    )}`}
                  >
                    {venue.isVerified && venue.subscriptionActive
                      ? "Verificado"
                      : "Sin verificar"}
                  </span>
                </div>
              </div>

              <Link
                href={`/panel/locales/${venue.id}`}
                className="inline-flex justify-center rounded-full border border-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-[color:var(--brand)] transition hover:bg-[color:var(--brand-soft)] md:justify-self-end"
              >
                Editar
              </Link>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
