import Link from "next/link";
import { MapPin, Search } from "lucide-react";

import { OsmCandidatePicker } from "@/components/admin/osm-candidate-picker";
import { getMapPlaceCities } from "@/features/admin/services/map-places-admin-service";
import {
  importOpenStreetMapPlacesAction,
  openStreetMapSearchKinds,
  searchOpenStreetMapPlaces,
} from "@/features/admin/services/openstreetmap-import-service";

type ImportPlacesPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function readParam(
  searchParams: ImportPlacesPageProps["searchParams"],
  key: string,
) {
  const value = searchParams?.[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function ImportPlacesPage({ searchParams }: ImportPlacesPageProps) {
  const cities = await getMapPlaceCities();
  const requestedCityId = readParam(searchParams, "cityId");
  const selectedCity =
    cities.find((city) => city.id === requestedCityId) ?? cities[0] ?? null;
  const requestedKind = readParam(searchParams, "kind") || "water";
  const shouldSearch = readParam(searchParams, "buscar") === "1";
  const selectionError = readParam(searchParams, "error") === "seleccion";
  let candidates: Awaited<ReturnType<typeof searchOpenStreetMapPlaces>> = [];
  let searchError = "";

  if (shouldSearch && selectedCity) {
    try {
      candidates = await searchOpenStreetMapPlaces({
        cityId: selectedCity.id,
        cityName: selectedCity.name,
        kind: requestedKind,
      });
    } catch (error) {
      searchError = error instanceof Error
        ? error.message
        : "No se pudo completar la búsqueda en OpenStreetMap.";
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#741314]/58">
            Importación asistida
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[#381932]">
            Buscar lugares públicos
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#381932]/62">
            Encuentra fuentes, bancos, mesas y servicios registrados en OpenStreetMap.
            Nada se publica hasta que lo revises manualmente.
          </p>
        </div>
        <Link
          href="/panel/lugares"
          className="rounded-full border border-[#741314]/18 bg-white px-5 py-3 text-sm font-bold text-[#741314]"
        >
          Volver a lugares
        </Link>
      </header>

      <form
        method="get"
        className="grid gap-4 rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 shadow-[0_16px_45px_rgba(116,19,20,0.06)] sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
      >
        <input type="hidden" name="buscar" value="1" />
        <label className="text-sm font-semibold text-[#381932]">
          Ciudad
          <select
            name="cityId"
            defaultValue={selectedCity?.id ?? ""}
            className="mt-2 w-full rounded-xl border border-[#741314]/16 bg-white px-3.5 py-3 text-sm text-[#381932] outline-none focus:border-[#741314] focus:ring-2 focus:ring-[#741314]/10"
          >
            {cities.map((city) => (
              <option key={city.id} value={city.id}>{city.name}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-[#381932]">
          Qué quieres localizar
          <select
            name="kind"
            defaultValue={requestedKind}
            className="mt-2 w-full rounded-xl border border-[#741314]/16 bg-white px-3.5 py-3 text-sm text-[#381932] outline-none focus:border-[#741314] focus:ring-2 focus:ring-[#741314]/10"
          >
            {openStreetMapSearchKinds.map((kind) => (
              <option key={kind.value} value={kind.value}>{kind.label}</option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={!selectedCity}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#741314] px-5 py-3 text-sm font-bold text-[#FFF7E8] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
          Buscar
        </button>
      </form>

      {selectionError ? (
        <p role="alert" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          Selecciona al menos un lugar que todavía no esté importado.
        </p>
      ) : null}

      {searchError ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {searchError}
        </p>
      ) : null}

      {shouldSearch && !searchError ? (
        candidates.length === 0 ? (
            <div className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-8 text-center">
              <p className="font-semibold text-[#381932]">No se encontraron lugares de este tipo.</p>
              <p className="mt-2 text-sm text-[#381932]/58">
                Prueba otra categoría o añade el punto manualmente.
              </p>
            </div>
          ) : (
            <OsmCandidatePicker
              accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ""}
              candidates={candidates}
              cityId={selectedCity?.id ?? ""}
              kind={requestedKind}
              action={importOpenStreetMapPlacesAction}
            />
          )
      ) : (
        <div className="rounded-2xl border border-dashed border-[#741314]/18 bg-white/55 p-8 text-center">
          <MapPin className="mx-auto h-8 w-8 text-[#741314]" aria-hidden="true" />
          <p className="mt-3 font-semibold text-[#381932]">Busca primero y revisa después.</p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#381932]/58">
            OpenStreetMap sirve para descubrir candidatos. Pickyalo mantiene el control editorial y la publicación manual.
          </p>
        </div>
      )}
    </section>
  );
}
