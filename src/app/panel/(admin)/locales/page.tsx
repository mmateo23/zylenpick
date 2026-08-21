import Link from "next/link";

import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { getAdminVenues } from "@/features/admin/services/venues-admin-service";

type AdminVenuesPageProps = {
  searchParams?: { q?: string; estado?: string; pagina?: string };
};

export default async function AdminVenuesPage({ searchParams }: AdminVenuesPageProps) {
  const query = searchParams?.q?.trim() ?? "";
  const status = searchParams?.estado ?? "";
  const requestedPage = Number(searchParams?.pagina ?? "1");
  const result = await getAdminVenues({
    query,
    status,
    page: Number.isFinite(requestedPage) ? requestedPage : 1,
  });

  return (
    <section className="space-y-5">
      <AdminPageHeader
        eyebrow="Locales"
        title="Locales y comercios"
        description="Busca una ficha, comprueba su estado y entra directamente a editarla."
        action={
          <Link
            href="/panel/locales/nuevo"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#741314] px-5 text-sm font-bold text-[#FFF7E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2"
          >
            Crear local
          </Link>
        }
      />

      <AdminListToolbar
        initialQuery={query}
        placeholder="Buscar local por nombre"
        filters={[
          {
            label: "Estado",
            param: "estado",
            value: status,
            options: [
              { label: "Todos", value: "" },
              { label: "Publicados", value: "published" },
              { label: "Ocultos", value: "hidden" },
              { label: "Activos", value: "active" },
              { label: "Inactivos", value: "inactive" },
            ],
          },
        ]}
      />

      <p className="px-1 text-sm font-medium text-[#381932]/65">
        {result.total} {result.total === 1 ? "local encontrado" : "locales encontrados"}
      </p>

      <section className="overflow-hidden rounded-2xl border border-[#741314]/12 bg-[#FFF7E8]">
        {result.items.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="font-semibold text-[#381932]">No hay locales con estos filtros.</p>
            <p className="mt-2 text-sm text-[#381932]/60">Prueba otra búsqueda o vuelve a mostrar todos.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#741314]/10">
            {result.items.map((venue) => (
              <article
                key={venue.id}
                className="grid gap-4 px-4 py-4 text-sm text-[#24110E] sm:px-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] md:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="min-w-0 truncate text-base font-semibold text-[#24110E]">{venue.name}</h2>
                    <AdminStatusBadge tone={venue.isPublished ? "success" : "neutral"}>
                      {venue.isPublished ? "Publicado" : "Oculto"}
                    </AdminStatusBadge>
                  </div>
                  <p className="mt-2 text-sm text-[#381932]/70">{venue.cityName ?? "Sin ciudad"}</p>
                  <p className="mt-1 truncate text-xs text-[#381932]/55">/{venue.slug}</p>
                </div>

                <div className="grid gap-1.5 text-[#381932]/75">
                  <p className="min-w-0 truncate"><span className="font-semibold">Tel.</span> {venue.phone ?? "Sin teléfono"}</p>
                  <p className="min-w-0 truncate"><span className="font-semibold">Email</span> {venue.email ?? "Sin email"}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <AdminStatusBadge tone={venue.isActive ? "success" : "neutral"}>
                      {venue.isActive ? "Activo" : "Inactivo"}
                    </AdminStatusBadge>
                    <AdminStatusBadge tone={venue.isVerified && venue.subscriptionActive ? "success" : "warning"}>
                      {venue.isVerified && venue.subscriptionActive ? "Verificado" : "Sin verificar"}
                    </AdminStatusBadge>
                  </div>
                </div>

                <Link
                  href={`/panel/locales/${venue.id}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#741314]/18 bg-white px-5 text-sm font-bold text-[#741314] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] md:justify-self-end"
                >
                  Editar
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <AdminPagination
        page={result.page}
        total={result.total}
        pageSize={result.pageSize}
        searchParams={searchParams}
      />
    </section>
  );
}
