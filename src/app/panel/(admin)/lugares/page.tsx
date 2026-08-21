import { Camera, Copy, Download, Eye, Pencil, Shapes } from "lucide-react";
import Link from "next/link";

import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { getAdminMapPlaceCategories } from "@/features/admin/services/map-place-categories-admin-service";
import { getAdminMapPlaces, getAdminMapPlacesSummary } from "@/features/admin/services/map-places-admin-service";
import { getMapPlaceCategory } from "@/features/map-places/categories";

const statusLabels = { draft: "Borrador", review: "Revisión", published: "Publicado" };
const planRoleLabels = { discover: "Descubrir", enjoy: "Disfrutar", support: "Apoyo" };

type AdminMapPlacesPageProps = {
  searchParams?: {
    importados?: string;
    omitidos?: string;
    estado?: string;
    categoria?: string;
    q?: string;
    pagina?: string;
  };
};

export default async function AdminMapPlacesPage({ searchParams }: AdminMapPlacesPageProps) {
  const query = searchParams?.q?.trim() ?? "";
  const status = searchParams?.estado ?? "";
  const category = searchParams?.categoria ?? "";
  const requestedPage = Number(searchParams?.pagina ?? "1");
  const [result, categories, summary] = await Promise.all([
    getAdminMapPlaces({ query, status, category, page: Number.isFinite(requestedPage) ? requestedPage : 1 }),
    getAdminMapPlaceCategories(),
    getAdminMapPlacesSummary(),
  ]);

  return (
    <section className="space-y-5">
      <AdminPageHeader
        eyebrow="Mapa de descubrimiento"
        title="Lugares útiles"
        description="Captura sobre el terreno, completa lo pendiente y publica únicamente información revisada."
        action={
          <Link href="/panel/scout" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#741314] px-5 text-sm font-bold text-[#FFF7E8]">
            <Camera aria-hidden="true" className="h-4 w-4" /> Abrir Scout
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2">
        <Link href="/panel/lugares/categorias" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#741314]/18 bg-white px-4 text-sm font-bold text-[#741314]"><Shapes aria-hidden="true" className="h-4 w-4" />Categorías</Link>
        <Link href="/panel/lugares/importar" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#741314]/18 bg-white px-4 text-sm font-bold text-[#741314]"><Download aria-hidden="true" className="h-4 w-4" />Importar OSM</Link>
        <Link href="/panel/lugares/nuevo" className="inline-flex min-h-11 items-center rounded-xl border border-[#741314]/18 bg-white px-4 text-sm font-bold text-[#741314]">Añadir manualmente</Link>
      </div>

      {searchParams?.importados ? (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
          {searchParams.importados} lugares importados como borrador.{Number(searchParams.omitidos ?? 0) > 0 ? ` ${searchParams.omitidos} duplicados omitidos.` : ""}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Publicados", summary.published],
          ["Pendientes Scout", summary.pendingScout],
          ["Por completar", summary.incomplete],
          ["En planes", summary.planCandidates],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-4">
            <p className="text-xs font-bold text-[#741314]/65">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-[#381932]">{value}</p>
          </div>
        ))}
      </div>

      <AdminListToolbar
        initialQuery={query}
        placeholder="Buscar lugar por nombre"
        filters={[
          {
            label: "Estado",
            param: "estado",
            value: status,
            options: [
              { label: "Todos", value: "" },
              { label: `Pendientes Scout (${summary.pendingScout})`, value: "pending" },
              { label: "Borradores", value: "draft" },
              { label: "En revisión", value: "review" },
              { label: "Publicados", value: "published" },
              { label: "Inactivos", value: "inactive" },
            ],
          },
          {
            label: "Categoría",
            param: "categoria",
            value: category,
            options: [
              { label: "Todas", value: "" },
              ...categories.filter((item) => item.isActive).map((item) => ({ label: item.label, value: item.value })),
            ],
          },
        ]}
      />

      <p className="px-1 text-sm font-medium text-[#381932]/65">{result.total} {result.total === 1 ? "lugar" : "lugares"}</p>

      <section className="overflow-hidden rounded-2xl border border-[#741314]/12 bg-[#FFF7E8]">
        {result.items.length === 0 ? (
          <div className="p-8 text-center"><p className="font-semibold text-[#381932]">No hay lugares con estos filtros.</p><p className="mt-2 text-sm text-[#381932]/58">Las capturas nuevas aparecerán aquí en cuanto se guarden.</p></div>
        ) : (
          <div className="divide-y divide-[#741314]/10">
            {result.items.map((place) => {
              const placeCategory = place.category ? getMapPlaceCategory(place.category, categories) : null;
              const isPendingScout = place.captureMethod === "scout" && place.status === "draft";
              const imageUrl = place.thumbnailImageUrl ?? place.coverImageUrl;
              return (
                <article key={place.id} className="grid gap-4 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:p-5">
                  <div className="hidden h-14 w-14 overflow-hidden rounded-xl border border-[#741314]/10 bg-white sm:block">
                    {imageUrl ? (
                      // The source can be a legacy URL not covered by next/image patterns.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl} alt="" width={56} height={56} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-[#381932]">{place.name || "Captura sin nombre"}</h2>
                      <span className="rounded-full border border-[#741314]/14 bg-white px-2.5 py-1 text-[11px] font-bold text-[#741314]">{placeCategory?.shortLabel ?? "Sin categoría"}</span>
                      <AdminStatusBadge tone={place.status === "published" && place.isActive ? "success" : isPendingScout ? "warning" : "neutral"}>{isPendingScout ? "Pendiente" : statusLabels[place.status]}</AdminStatusBadge>
                      {place.isPlanCandidate ? <AdminStatusBadge tone="info">Plan · {planRoleLabels[place.planRole]}</AdminStatusBadge> : null}
                    </div>
                    <p className="mt-2 text-sm text-[#381932]/65">{place.city.name} · {place.latitude !== null && place.longitude !== null ? `${place.latitude.toFixed(5)}, ${place.longitude.toFixed(5)}` : "Ubicación pendiente"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:flex">
                    {place.status === "published" && place.isActive && place.slug ? <Link href={`/mapa?lugar=${place.slug}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#741314]/14 bg-white px-3 text-sm font-semibold text-[#381932]/70"><Eye aria-hidden="true" className="h-4 w-4" />Ver</Link> : null}
                    {!isPendingScout ? <Link href={`/panel/lugares/nuevo?copiar=${place.id}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#741314]/18 bg-white px-3 text-sm font-semibold text-[#741314]"><Copy aria-hidden="true" className="h-4 w-4" />Duplicar</Link> : null}
                    <Link href={`/panel/lugares/${place.id}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#741314] px-4 text-sm font-semibold text-[#FFF7E8]"><Pencil aria-hidden="true" className="h-4 w-4" />{isPendingScout ? "Completar" : "Editar"}</Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <AdminPagination page={result.page} total={result.total} pageSize={result.pageSize} searchParams={searchParams} />
    </section>
  );
}
