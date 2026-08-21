import Link from "next/link";
import { Camera, Copy, Download, Eye, Pencil, Shapes } from "lucide-react";

import { getMapPlaceCategory } from "@/features/map-places/categories";
import { getAdminMapPlaceCategories } from "@/features/admin/services/map-place-categories-admin-service";
import { getAdminMapPlaces } from "@/features/admin/services/map-places-admin-service";

const statusLabels = {
  draft: "Borrador",
  review: "Revisión",
  published: "Publicado",
};

const planRoleLabels = {
  discover: "Descubrir",
  enjoy: "Disfrutar",
  support: "Apoyo",
};

type AdminMapPlacesPageProps = {
  searchParams?: {
    importados?: string;
    omitidos?: string;
    estado?: string;
  };
};

export default async function AdminMapPlacesPage({ searchParams }: AdminMapPlacesPageProps) {
  const [places, categories] = await Promise.all([
    getAdminMapPlaces(),
    getAdminMapPlaceCategories(),
  ]);
  const publishedCount = places.filter((place) => place.status === "published" && place.isActive).length;
  const planCandidateCount = places.filter((place) => place.isPlanCandidate).length;
  const incompleteCount = places.filter((place) => !place.description || !place.coverImageUrl).length;
  const pendingScoutCount = places.filter(
    (place) => place.captureMethod === "scout" && place.status === "draft",
  ).length;
  const showingPending = searchParams?.estado === "pendientes";
  const visiblePlaces = showingPending
    ? places.filter((place) => place.captureMethod === "scout" && place.status === "draft")
    : places;

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#741314]/58">Mapa de descubrimiento</p>
          <h1 className="mt-3 text-3xl font-semibold text-[#381932]">Lugares útiles</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#381932]/62">
            Marca sobre el terreno mesas, parques, monumentos y servicios que ayudan a descubrir cada zona.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/panel/scout" className="inline-flex items-center gap-2 rounded-full bg-[#741314] px-5 py-3 text-sm font-bold text-[#FFF7E8]">
            <Camera aria-hidden="true" className="h-4 w-4" />
            Abrir Scout
          </Link>
          <Link href="/panel/lugares/categorias" className="inline-flex items-center gap-2 rounded-full border border-[#741314]/18 bg-white px-5 py-3 text-sm font-bold text-[#741314]">
            <Shapes aria-hidden="true" className="h-4 w-4" />
            Categorías
          </Link>
          <Link href="/panel/lugares/importar" className="inline-flex items-center gap-2 rounded-full border border-[#741314]/18 bg-white px-5 py-3 text-sm font-bold text-[#741314]">
            <Download aria-hidden="true" className="h-4 w-4" />
            Importar de OSM
          </Link>
          <Link href="/panel/lugares/nuevo" className="rounded-full border border-[#741314]/18 bg-white px-5 py-3 text-sm font-bold text-[#741314]">
            Añadir lugar
          </Link>
        </div>
      </header>

      {searchParams?.importados ? (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
          {searchParams.importados} lugares importados como borrador.
          {Number(searchParams.omitidos ?? 0) > 0
            ? ` ${searchParams.omitidos} duplicados omitidos.`
            : ""}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Publicados", publishedCount],
          ["En planes", planCandidateCount],
          ["Por completar", incompleteCount],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#741314]/55">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-[#381932]">{value}</p>
          </div>
        ))}
      </div>

      <nav aria-label="Filtros de lugares" className="flex flex-wrap gap-2">
        <Link
          href="/panel/lugares"
          aria-current={!showingPending ? "page" : undefined}
          className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-bold ${!showingPending ? "bg-[#741314] text-[#FFF7E8]" : "border border-[#741314]/16 bg-white text-[#741314]"}`}
        >
          Todos
        </Link>
        <Link
          href="/panel/lugares?estado=pendientes"
          aria-current={showingPending ? "page" : undefined}
          className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-bold ${showingPending ? "bg-[#741314] text-[#FFF7E8]" : "border border-[#741314]/16 bg-white text-[#741314]"}`}
        >
          Pendientes Scout · {pendingScoutCount}
        </Link>
      </nav>

      <div className="overflow-hidden rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] shadow-[0_16px_45px_rgba(116,19,20,0.06)]">
        {visiblePlaces.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-semibold text-[#381932]">
              {showingPending ? "No hay capturas pendientes." : "Aún no hay lugares marcados."}
            </p>
            <p className="mt-2 text-sm text-[#381932]/58">
              {showingPending ? "Las nuevas capturas Scout aparecerán aquí." : "Empieza por un punto que puedas comprobar en persona."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#741314]/10">
            {visiblePlaces.map((place) => {
              const category = place.category
                ? getMapPlaceCategory(place.category, categories)
                : null;
              const isPendingScout = place.captureMethod === "scout" && place.status === "draft";
              return (
                <article key={place.id} className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-[#381932]">{place.name || "Captura sin nombre"}</h2>
                      <span className="rounded-full border border-[#741314]/14 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#741314]">
                        {category?.shortLabel ?? "Sin categoría"}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${place.status === "published" && place.isActive ? "bg-emerald-100 text-emerald-800" : "bg-[#381932]/[0.07] text-[#381932]/60"}`}>
                        {isPendingScout ? "Pendiente" : statusLabels[place.status]}
                      </span>
                      {place.isPlanCandidate ? (
                        <span className="rounded-full bg-[#FDE3AD] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#741314]">
                          Plan · {planRoleLabels[place.planRole]}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-[#381932]/60">
                      {place.city.name} · {place.latitude !== null && place.longitude !== null
                        ? `${place.latitude.toFixed(5)}, ${place.longitude.toFixed(5)}`
                        : "Ubicación pendiente"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:flex">
                    {place.status === "published" && place.isActive && place.slug ? (
                      <Link href={`/mapa?lugar=${place.slug}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#741314]/14 px-4 py-2 text-center text-sm font-semibold text-[#381932]/65">
                        <Eye aria-hidden="true" className="h-4 w-4" />
                        Ver
                      </Link>
                    ) : null}
                    {!isPendingScout ? (
                      <Link href={`/panel/lugares/nuevo?copiar=${place.id}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#741314]/18 px-4 py-2 text-center text-sm font-semibold text-[#741314]">
                        <Copy aria-hidden="true" className="h-4 w-4" />
                        Duplicar
                      </Link>
                    ) : null}
                    <Link href={`/panel/lugares/${place.id}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#741314] px-4 py-2 text-center text-sm font-semibold text-[#FFF7E8]">
                      <Pencil aria-hidden="true" className="h-4 w-4" />
                      Editar
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
