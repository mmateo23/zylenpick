import Link from "next/link";

import { getMapPlaceCategory } from "@/features/map-places/categories";
import { getAdminMapPlaces } from "@/features/admin/services/map-places-admin-service";

const statusLabels = {
  draft: "Borrador",
  review: "Revisión",
  published: "Publicado",
};

export default async function AdminMapPlacesPage() {
  const places = await getAdminMapPlaces();

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
        <Link href="/panel/lugares/nuevo" className="rounded-full bg-[#741314] px-5 py-3 text-sm font-bold text-[#FFF7E8]">
          Añadir lugar
        </Link>
      </header>

      <div className="overflow-hidden rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] shadow-[0_16px_45px_rgba(116,19,20,0.06)]">
        {places.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-semibold text-[#381932]">Aún no hay lugares marcados.</p>
            <p className="mt-2 text-sm text-[#381932]/58">Empieza por un punto que puedas comprobar en persona.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#741314]/10">
            {places.map((place) => {
              const category = getMapPlaceCategory(place.category);
              return (
                <article key={place.id} className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-[#381932]">{place.name}</h2>
                      <span className="rounded-full border border-[#741314]/14 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#741314]">
                        {category.shortLabel}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${place.status === "published" && place.isActive ? "bg-emerald-100 text-emerald-800" : "bg-[#381932]/[0.07] text-[#381932]/60"}`}>
                        {statusLabels[place.status]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[#381932]/60">{place.city.name} · {place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}</p>
                  </div>
                  <Link href={`/panel/lugares/${place.id}`} className="rounded-full border border-[#741314]/22 px-4 py-2 text-center text-sm font-semibold text-[#741314]">
                    Editar
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
