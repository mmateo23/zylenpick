"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import { Check, CheckCircle2, ExternalLink, LocateFixed, MapPin, RotateCcw } from "lucide-react";

import { getMapPlaceCategory } from "@/features/map-places/categories";
import type { OpenStreetMapCandidate } from "@/features/admin/services/openstreetmap-import-service";

type OsmCandidatePickerProps = {
  accessToken: string;
  candidates: OpenStreetMapCandidate[];
  cityId: string;
  kind: string;
  action: (formData: FormData) => void;
};

const sourceId = "osm-review-candidates";
const pointLayerId = `${sourceId}-points`;
const maxSelection = 50;

function ensureMapboxStylesheet() {
  if (document.getElementById("mapbox-gl-osm-review-stylesheet")) return;
  const stylesheet = document.createElement("link");
  stylesheet.id = "mapbox-gl-osm-review-stylesheet";
  stylesheet.rel = "stylesheet";
  stylesheet.href = "https://api.mapbox.com/mapbox-gl-js/v3.22.0/mapbox-gl.css";
  document.head.append(stylesheet);
}

function createCandidateData(
  candidates: OpenStreetMapCandidate[],
  selectedIds: Set<string>,
  activeId: string | null,
) {
  return {
    type: "FeatureCollection" as const,
    features: candidates.map((candidate) => ({
      type: "Feature" as const,
      properties: {
        externalId: candidate.externalId,
        selected: selectedIds.has(candidate.externalId),
        active: candidate.externalId === activeId,
        imported: candidate.alreadyImported,
        category: candidate.category,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [candidate.longitude, candidate.latitude],
      },
    })),
  };
}

export function OsmCandidatePicker({
  accessToken,
  candidates,
  cityId,
  kind,
  action,
}: OsmCandidatePickerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const candidatesRef = useRef(candidates);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(
    candidates.find((candidate) => !candidate.alreadyImported)?.externalId ?? candidates[0]?.externalId ?? null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const availableCandidates = useMemo(
    () => candidates.filter((candidate) => !candidate.alreadyImported),
    [candidates],
  );
  const candidateById = useMemo(
    () => new Map(candidates.map((candidate) => [candidate.externalId, candidate])),
    [candidates],
  );
  const activeCandidate = activeId ? candidateById.get(activeId) ?? null : null;

  useEffect(() => {
    candidatesRef.current = candidates;
  }, [candidates]);

  function toggleCandidate(externalId: string) {
    const candidate = candidateById.get(externalId);
    if (!candidate || candidate.alreadyImported) return;
    setMessage(null);
    setActiveId(externalId);
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(externalId)) {
        next.delete(externalId);
      } else if (next.size < maxSelection) {
        next.add(externalId);
      } else {
        setMessage(`Puedes importar un máximo de ${maxSelection} lugares cada vez.`);
      }
      return next;
    });
  }

  function focusCandidate(candidate: OpenStreetMapCandidate) {
    setActiveId(candidate.externalId);
    mapRef.current?.flyTo({
      center: [candidate.longitude, candidate.latitude],
      zoom: Math.max(mapRef.current.getZoom(), 17),
      essential: true,
    });
  }

  useEffect(() => {
    if (!accessToken || !mapContainerRef.current || candidates.length === 0) return;
    let cancelled = false;
    ensureMapboxStylesheet();

    async function setupMap() {
      const mapboxgl = await import("mapbox-gl");
      if (cancelled || !mapContainerRef.current) return;
      mapboxgl.default.accessToken = accessToken;
      const first = candidates[0];
      const map = new mapboxgl.default.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [first.longitude, first.latitude],
        zoom: 13,
        attributionControl: false,
      });
      mapRef.current = map;
      map.addControl(new mapboxgl.default.NavigationControl({ showCompass: false }), "top-right");

      map.once("load", () => {
        if (cancelled) return;
        map.addSource(sourceId, {
          type: "geojson",
          data: createCandidateData(candidatesRef.current, new Set(), activeId),
        });
        map.addLayer({
          id: pointLayerId,
          type: "circle",
          source: sourceId,
          paint: {
            "circle-radius": [
              "case",
              ["==", ["get", "active"], true],
              11,
              ["==", ["get", "selected"], true],
              9,
              7,
            ],
            "circle-color": [
              "case",
              ["==", ["get", "imported"], true],
              "#B5ACA6",
              ["==", ["get", "selected"], true],
              "#741314",
              ["==", ["get", "category"], "bench"],
              "#4F6954",
              ["==", ["get", "category"], "tables"],
              "#C47A3D",
              "#FFF7E8",
            ],
            "circle-stroke-color": [
              "case",
              ["==", ["get", "active"], true],
              "#FED47D",
              "#741314",
            ],
            "circle-stroke-width": [
              "case",
              ["==", ["get", "active"], true],
              4,
              2,
            ],
            "circle-opacity": [
              "case",
              ["==", ["get", "imported"], true],
              0.55,
              1,
            ],
          },
        });
        const bounds = new mapboxgl.default.LngLatBounds();
        candidatesRef.current.forEach((candidate) => bounds.extend([candidate.longitude, candidate.latitude]));
        map.fitBounds(bounds, { padding: 56, maxZoom: 16, duration: 0 });
        map.on("mouseenter", pointLayerId, () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", pointLayerId, () => { map.getCanvas().style.cursor = ""; });
        map.on("click", pointLayerId, (event) => {
          const externalId = event.features?.[0]?.properties?.externalId;
          if (typeof externalId === "string") toggleCandidate(externalId);
        });
      });
    }

    void setupMap();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // The search page remounts this component whenever its candidate set changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    const source = mapRef.current?.getSource(sourceId) as
      | { setData: (data: ReturnType<typeof createCandidateData>) => void }
      | undefined;
    source?.setData(createCandidateData(candidates, selectedIds, activeId));
  }, [activeId, candidates, selectedIds]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="cityId" value={cityId} />
      <input type="hidden" name="kind" value={kind} />
      {Array.from(selectedIds).map((externalId) => {
        const candidate = candidateById.get(externalId);
        return candidate ? (
          <input key={externalId} type="hidden" name="candidate" value={JSON.stringify(candidate)} />
        ) : null;
      })}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-4">
        <div>
          <p className="font-semibold text-[#381932]">
            {candidates.length} resultados · {availableCandidates.length} disponibles
          </p>
          <p className="mt-1 text-xs leading-5 text-[#381932]/58">
            Selecciona en el mapa o en la lista. Se guardarán como borradores.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedIds(new Set(availableCandidates.slice(0, maxSelection).map((candidate) => candidate.externalId)));
              setMessage(null);
            }}
            disabled={availableCandidates.length === 0}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#741314]/18 bg-white px-4 py-2.5 text-sm font-bold text-[#741314] disabled:opacity-45"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            Seleccionar {Math.min(availableCandidates.length, maxSelection)}
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedIds(new Set());
              setMessage(null);
            }}
            disabled={selectedIds.size === 0}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#741314]/18 bg-white text-[#741314] disabled:opacity-45"
            aria-label="Limpiar selección"
            title="Limpiar selección"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="submit"
            disabled={selectedIds.size === 0}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#741314] px-5 py-2.5 text-sm font-bold text-[#FFF7E8] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Importar {selectedIds.size || "selección"}
          </button>
        </div>
      </div>

      {message ? (
        <p role="alert" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950">
          {message}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)] lg:items-start">
        <section className="overflow-hidden rounded-2xl border border-[#741314]/14 bg-[#F4DFC0] lg:sticky lg:top-24">
          <div className="relative h-[22rem] sm:h-[30rem] lg:h-[calc(100svh-10rem)] lg:min-h-[34rem] lg:max-h-[48rem]">
            {accessToken ? (
              <div className="absolute inset-0">
                <div
                  ref={mapContainerRef}
                  className="h-full w-full"
                  aria-label="Mapa de candidatos de OpenStreetMap"
                />
              </div>
            ) : (
              <div className="absolute inset-0 grid place-items-center p-8 text-center text-sm font-semibold text-[#741314]">
                Configura Mapbox para revisar los candidatos sobre el mapa.
              </div>
            )}
            <div className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/70 bg-[#FFF7E8]/92 px-3 py-2 text-xs font-bold text-[#741314] shadow-sm backdrop-blur">
              {selectedIds.size}/{maxSelection} seleccionados
            </div>
            <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-1.5 text-[10px] font-bold text-[#381932]">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-[#FFF7E8]/92 px-2.5 py-1.5 shadow-sm backdrop-blur">
                <span className="h-2.5 w-2.5 rounded-full bg-[#4F6954]" /> Banco
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-[#FFF7E8]/92 px-2.5 py-1.5 shadow-sm backdrop-blur">
                <span className="h-2.5 w-2.5 rounded-full bg-[#C47A3D]" /> Mesa con bancos
              </span>
            </div>
          </div>

          {activeCandidate ? (
            <div className="border-t border-[#741314]/12 bg-[#FFF7E8] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#381932]">{activeCandidate.name}</p>
                  <p className="mt-1 text-xs leading-5 text-[#381932]/62">
                    {activeCandidate.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleCandidate(activeCandidate.externalId)}
                  disabled={activeCandidate.alreadyImported}
                  className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${
                    selectedIds.has(activeCandidate.externalId)
                      ? "bg-[#741314] text-[#FFF7E8]"
                      : "border border-[#741314]/18 bg-white text-[#741314]"
                  } disabled:opacity-45`}
                >
                  {activeCandidate.alreadyImported
                    ? "Importado"
                    : selectedIds.has(activeCandidate.externalId)
                      ? "Seleccionado"
                      : "Seleccionar"}
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section aria-label="Resultados de OpenStreetMap" className="space-y-2">
          {candidates.map((candidate) => {
            const category = getMapPlaceCategory(candidate.category);
            const isSelected = selectedIds.has(candidate.externalId);
            const isActive = candidate.externalId === activeId;
            return (
              <div
                key={candidate.externalId}
                className={`rounded-2xl border p-3 transition ${
                  isActive
                    ? "border-[#741314]/45 bg-white shadow-[0_10px_28px_rgba(116,19,20,0.08)]"
                    : "border-[#741314]/10 bg-[#FFF7E8]"
                } ${candidate.alreadyImported ? "opacity-60" : ""}`}
              >
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={candidate.alreadyImported}
                    onChange={() => toggleCandidate(candidate.externalId)}
                    aria-label={`Seleccionar ${candidate.name}`}
                    className="mt-1 h-5 w-5 accent-[#741314]"
                  />
                  <button type="button" onClick={() => focusCandidate(candidate)} className="min-w-0 text-left">
                    <span className="flex flex-wrap items-center gap-2">
                      <strong className="truncate text-sm text-[#381932]">{candidate.name}</strong>
                      <span className="rounded-full border border-[#741314]/14 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#741314]">
                        {category.shortLabel}
                      </span>
                    </span>
                    <span className="mt-1.5 line-clamp-2 block text-xs leading-5 text-[#381932]/60">
                      {candidate.description}
                    </span>
                    <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#381932]/50">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {candidate.latitude.toFixed(5)}, {candidate.longitude.toFixed(5)}
                    </span>
                  </button>
                  {candidate.alreadyImported ? (
                    <span title="Ya importado" className="text-emerald-700">
                      <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => focusCandidate(candidate)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#741314]/12 bg-white text-[#741314]"
                      aria-label={`Ver ${candidate.name} en el mapa`}
                    >
                      <LocateFixed className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
                <a
                  href={`https://www.openstreetmap.org/${candidate.osmType}/${candidate.osmId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#741314] underline underline-offset-2"
                >
                  Comprobar en OSM <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </div>
            );
          })}
        </section>
      </div>
    </form>
  );
}
