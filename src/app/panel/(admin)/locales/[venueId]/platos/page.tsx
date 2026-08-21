import Link from "next/link";

import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import {
  getAdminMenuItemsByVenueId,
  requireAdminVenueContext,
  toggleMenuItemAvailabilityAction,
} from "@/features/admin/services/menu-items-admin-service";
import { formatPrice } from "@/lib/utils/currency";

type AdminVenueMenuItemsPageProps = {
  params: { venueId: string };
  searchParams?: { q?: string; estado?: string; pagina?: string };
};

export default async function AdminVenueMenuItemsPage({ params, searchParams }: AdminVenueMenuItemsPageProps) {
  const query = searchParams?.q?.trim() ?? "";
  const status = searchParams?.estado ?? "";
  const requestedPage = Number(searchParams?.pagina ?? "1");
  const [venue, result] = await Promise.all([
    requireAdminVenueContext(params.venueId),
    getAdminMenuItemsByVenueId(params.venueId, {
      query,
      status,
      page: Number.isFinite(requestedPage) ? requestedPage : 1,
    }),
  ]);

  return (
    <section className="space-y-5">
      <AdminPageHeader
        eyebrow="Productos"
        title={`Selección de ${venue.name}`}
        description="Busca, edita o pausa productos desde una vista clara."
        action={
          <Link href={`/panel/locales/${venue.id}/platos/nuevo`} className="inline-flex min-h-11 items-center rounded-full bg-[#741314] px-5 text-sm font-bold text-[#FFF7E8]">
            Crear producto
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2">
        <Link href={`/panel/locales/${venue.id}`} className="inline-flex min-h-11 items-center rounded-xl border border-[#741314]/16 bg-white px-4 text-sm font-bold text-[#741314]">Volver al local</Link>
      </div>

      <AdminListToolbar
        initialQuery={query}
        placeholder="Buscar producto por nombre"
        filters={[
          {
            label: "Estado",
            param: "estado",
            value: status,
            options: [
              { label: "Todos", value: "" },
              { label: "Disponibles", value: "available" },
              { label: "Pausados", value: "paused" },
            ],
          },
        ]}
      />

      <p className="px-1 text-sm font-medium text-[#381932]/65">{result.total} {result.total === 1 ? "producto" : "productos"}</p>

      {result.items.length === 0 ? (
        <section className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] px-6 py-10 text-center">
          <p className="font-semibold text-[#381932]">No hay productos con estos filtros.</p>
        </section>
      ) : (
        <>
          <div className="grid gap-3 lg:hidden">
            {result.items.map((item) => {
              const toggleAction = toggleMenuItemAvailabilityAction.bind(null, venue.id, item.id, !item.isAvailable);
              return (
                <article key={item.id} className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-4">
                  <div className="flex gap-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#741314]/10 bg-white">
                      {item.imageUrl ? (
                        // Legacy product URLs may not be covered by next/image patterns.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt="" width={64} height={64} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h2 className="min-w-0 flex-1 font-semibold text-[#381932]">{item.name}</h2>
                        <AdminStatusBadge tone={item.isAvailable ? "success" : "neutral"}>{item.isAvailable ? "Disponible" : "Pausado"}</AdminStatusBadge>
                      </div>
                      <p className="mt-1 text-sm text-[#381932]/60">{item.categoryName ?? "Sin categoría"}</p>
                      <p className="mt-2 font-semibold text-[#381932]">{formatPrice(item.priceAmount, item.currency)}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link href={`/panel/locales/${venue.id}/platos/${item.id}`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#741314] px-4 text-sm font-bold text-[#FFF7E8]">Editar</Link>
                    <form action={toggleAction}><button type="submit" className="min-h-11 w-full rounded-xl border border-[#741314]/18 bg-white px-3 text-sm font-bold text-[#741314]">{item.isAvailable ? "Pausar" : "Activar"}</button></form>
                  </div>
                </article>
              );
            })}
          </div>

          <section className="hidden overflow-hidden rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] lg:block">
            <table className="min-w-full divide-y divide-[#741314]/10">
              <thead className="bg-[#741314]/[0.035]">
                <tr className="text-left text-xs font-bold uppercase tracking-[0.12em] text-[#381932]/60">
                  <th className="px-5 py-4">Producto</th><th className="px-5 py-4">Precio</th><th className="px-5 py-4">Estado</th><th className="px-5 py-4">Visibilidad</th><th className="px-5 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#741314]/10">
                {result.items.map((item) => {
                  const toggleAction = toggleMenuItemAvailabilityAction.bind(null, venue.id, item.id, !item.isAvailable);
                  return (
                    <tr key={item.id} className="text-sm text-[#381932]">
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#741314]/10 bg-white">{item.imageUrl ? (
                        // Legacy product URLs may not be covered by next/image patterns.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt="" width={48} height={48} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                      ) : null}</div><div><p className="font-semibold">{item.name}</p><p className="mt-1 text-xs text-[#381932]/55">{item.categoryName ?? "Sin categoría"}</p></div></div></td>
                      <td className="px-5 py-4 font-semibold">{formatPrice(item.priceAmount, item.currency)}</td>
                      <td className="px-5 py-4"><AdminStatusBadge tone={item.isAvailable ? "success" : "neutral"}>{item.isAvailable ? "Disponible" : "Pausado"}</AdminStatusBadge></td>
                      <td className="px-5 py-4"><div className="flex flex-wrap gap-2">{item.isFeatured ? <AdminStatusBadge tone="info">Destacado</AdminStatusBadge> : null}{item.isPickupMonthHighlight ? <AdminStatusBadge tone="warning">Top del mes</AdminStatusBadge> : null}{!item.isFeatured && !item.isPickupMonthHighlight ? <span className="text-[#381932]/50">Normal</span> : null}</div></td>
                      <td className="px-5 py-4"><div className="flex justify-end gap-2"><Link href={`/panel/locales/${venue.id}/platos/${item.id}`} className="inline-flex min-h-11 items-center rounded-xl border border-[#741314]/18 bg-white px-4 font-bold text-[#741314]">Editar</Link><form action={toggleAction}><button type="submit" className="min-h-11 rounded-xl px-3 font-bold text-[#741314]">{item.isAvailable ? "Pausar" : "Activar"}</button></form></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </>
      )}

      <AdminPagination page={result.page} total={result.total} pageSize={result.pageSize} searchParams={searchParams} />
    </section>
  );
}
