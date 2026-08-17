"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Map as MapboxMap, Marker } from "mapbox-gl";
import {
  Copy,
  LocateFixed,
  MapPin,
  Pentagon,
  Route,
  SlidersHorizontal,
  Trash2,
  Undo2,
} from "lucide-react";

import { AdminFormDisclosure } from "@/components/admin/admin-form-disclosure";
import { AdminPreviewLink } from "@/components/admin/admin-preview-link";
import type { MapPlaceCategoryDefinition } from "@/features/map-places/categories";
import { MapPlaceIcon } from "@/features/map-places/icons";
import {
  createPolygonGeometry,
  getPolygonCenter,
  getPolygonPoints,
  parsePolygonGeometry,
  type MapCoordinate,
} from "@/features/map-places/geometry";
import type {
  AdminMapPlaceFormValues,
  MapPlaceCityOption,
  MapPlaceParentOption,
} from "@/features/admin/services/map-places-admin-service";
import {
  getUserLocationErrorMessage,
  requestUserLocation,
} from "@/features/location/browser-location";

type AdminMapPlaceFormProps = {
  accessToken: string;
  cities: MapPlaceCityOption[];
  parentPlaces: MapPlaceParentOption[];
  categories: MapPlaceCategoryDefinition[];
  action: (formData: FormData) => void;
  initialValues?: AdminMapPlaceFormValues | null;
  initialParentId?: string;
  mode?: "create" | "edit" | "duplicate";
};

const defaultCenter: [number, number] = [-4.8308, 39.9579];
const areaSourceId = "admin-place-area";
const fieldClassName =
  "mt-2 w-full rounded-xl border border-[#741314]/16 bg-white px-3.5 py-3 text-sm text-[#381932] outline-none transition placeholder:text-[#381932]/38 focus:border-[#741314] focus:ring-2 focus:ring-[#741314]/10";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ensureMapboxStylesheet() {
  if (document.getElementById("mapbox-gl-admin-place-stylesheet")) return;
  const stylesheet = document.createElement("link");
  stylesheet.id = "mapbox-gl-admin-place-stylesheet";
  stylesheet.rel = "stylesheet";
  stylesheet.href = "https://api.mapbox.com/mapbox-gl-js/v3.22.0/mapbox-gl.css";
  document.head.append(stylesheet);
}

function readInitialPolygonPoints(initialValues?: AdminMapPlaceFormValues | null) {
  if (initialValues?.geometryType !== "polygon" || !initialValues.geometry) {
    return [];
  }

  try {
    return getPolygonPoints(parsePolygonGeometry(JSON.parse(initialValues.geometry)));
  } catch {
    return [];
  }
}

function createAreaPreviewData(points: MapCoordinate[]) {
  const polygon = createPolygonGeometry(points);
  return {
    type: "FeatureCollection" as const,
    features: [
      ...(polygon
        ? [
            {
              type: "Feature" as const,
              properties: { kind: "area" },
              geometry: polygon,
            },
          ]
        : []),
      ...(points.length > 0
        ? [
            {
              type: "Feature" as const,
              properties: { kind: "vertices" },
              geometry: {
                type: "MultiPoint" as const,
                coordinates: points,
              },
            },
          ]
        : []),
    ],
  };
}

function updateAreaPreview(map: MapboxMap, points: MapCoordinate[]) {
  const source = map.getSource(areaSourceId) as
    | { setData: (data: ReturnType<typeof createAreaPreviewData>) => void }
    | undefined;
  source?.setData(createAreaPreviewData(points));
}

export function AdminMapPlaceForm({
  accessToken,
  cities,
  parentPlaces,
  categories,
  action,
  initialValues,
  initialParentId,
  mode,
}: AdminMapPlaceFormProps) {
  const formMode = mode ?? (initialValues?.id ? "edit" : "create");
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const geometryTypeRef = useRef<"point" | "polygon">(
    initialValues?.geometryType ?? "point",
  );
  const polygonPointsRef = useRef<MapCoordinate[]>(
    readInitialPolygonPoints(initialValues),
  );
  const [name, setName] = useState(initialValues?.name ?? "");
  const selectedInitialParentId = initialValues?.parentPlaceId || initialParentId || "";
  const initialParent = parentPlaces.find((place) => place.id === selectedInitialParentId);
  const [cityId, setCityId] = useState(initialValues?.cityId ?? initialParent?.cityId ?? "");
  const [parentPlaceId, setParentPlaceId] = useState(selectedInitialParentId);
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(initialValues?.slug));
  const [latitude, setLatitude] = useState(initialValues?.latitude ?? "");
  const [longitude, setLongitude] = useState(initialValues?.longitude ?? "");
  const [accuracy, setAccuracy] = useState(initialValues?.locationAccuracyM ?? "");
  const [geometryType, setGeometryType] = useState<"point" | "polygon">(
    initialValues?.geometryType ?? "point",
  );
  const [polygonPoints, setPolygonPoints] = useState<MapCoordinate[]>(
    polygonPointsRef.current,
  );
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialValues?.category ?? categories[0]?.value ?? "park",
  );
  const selectedCategoryConfig =
    categories.find((category) => category.value === selectedCategory) ?? categories[0];
  const availableParentPlaces = parentPlaces.filter(
    (place) => place.cityId === cityId && place.id !== initialValues?.id,
  );

  useEffect(() => {
    if (!accessToken || !mapContainerRef.current) return;
    let cancelled = false;
    ensureMapboxStylesheet();

    async function setupMap() {
      const mapboxgl = await import("mapbox-gl");
      if (cancelled || !mapContainerRef.current) return;
      mapboxgl.default.accessToken = accessToken;

      const initialLatitude = Number(latitude);
      const initialLongitude = Number(longitude);
      const hasInitialPosition =
        Number.isFinite(initialLatitude) &&
        Number.isFinite(initialLongitude) &&
        latitude !== "" &&
        longitude !== "";
      const center: [number, number] = hasInitialPosition
        ? [initialLongitude, initialLatitude]
        : defaultCenter;

      const map = new mapboxgl.default.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center,
        zoom: hasInitialPosition ? 17 : 13,
        attributionControl: false,
      });
      mapRef.current = map;
      map.addControl(new mapboxgl.default.NavigationControl({ showCompass: false }), "top-right");

      const marker = new mapboxgl.default.Marker({
        color: "#741314",
        draggable: true,
      });
      markerRef.current = marker;
      if (hasInitialPosition) marker.setLngLat(center).addTo(map);

      const updateFromMarker = () => {
        const coordinates = marker.getLngLat();
        setLatitude(coordinates.lat.toFixed(7));
        setLongitude(coordinates.lng.toFixed(7));
        setLocationMessage("Punto ajustado manualmente en el mapa.");
      };
      marker.on("dragend", updateFromMarker);
      map.on("load", () => {
        map.addSource(areaSourceId, {
          type: "geojson",
          data: createAreaPreviewData(polygonPointsRef.current),
        });
        map.addLayer({
          id: `${areaSourceId}-fill`,
          type: "fill",
          source: areaSourceId,
          filter: ["==", ["get", "kind"], "area"],
          paint: {
            "fill-color": "#741314",
            "fill-opacity": 0.2,
          },
        });
        map.addLayer({
          id: `${areaSourceId}-line`,
          type: "line",
          source: areaSourceId,
          filter: ["==", ["get", "kind"], "area"],
          paint: {
            "line-color": "#741314",
            "line-width": 3,
          },
        });
        map.addLayer({
          id: `${areaSourceId}-vertices`,
          type: "circle",
          source: areaSourceId,
          filter: ["==", ["get", "kind"], "vertices"],
          paint: {
            "circle-color": "#FFF7E8",
            "circle-radius": 6,
            "circle-stroke-color": "#741314",
            "circle-stroke-width": 3,
          },
        });
      });
      map.on("click", (event) => {
        if (geometryTypeRef.current === "polygon") {
          const nextPoints = [
            ...polygonPointsRef.current,
            [event.lngLat.lng, event.lngLat.lat] as MapCoordinate,
          ];
          polygonPointsRef.current = nextPoints;
          setPolygonPoints(nextPoints);
          updateAreaPreview(map, nextPoints);
          setLocationMessage(
            nextPoints.length < 3
              ? `Punto ${nextPoints.length} añadido. Marca al menos ${3 - nextPoints.length} más.`
              : `Área delimitada con ${nextPoints.length} puntos. Puedes seguir añadiendo o guardar.`,
          );
          return;
        }

        marker.setLngLat(event.lngLat);
        if (!marker.getElement().isConnected) marker.addTo(map);
        updateFromMarker();
      });
    }

    setupMap().catch(() => setLocationMessage("No se pudo cargar el editor de mapa."));
    return () => {
      cancelled = true;
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // The map reads the initial coordinates only once; subsequent changes move the marker below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    geometryTypeRef.current = geometryType;
    polygonPointsRef.current = polygonPoints;

    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    if (geometryType === "polygon") {
      marker.remove();
      updateAreaPreview(map, polygonPoints);
      const polygon = createPolygonGeometry(polygonPoints);
      if (polygon) {
        const [nextLongitude, nextLatitude] = getPolygonCenter(polygon);
        setLatitude(nextLatitude.toFixed(7));
        setLongitude(nextLongitude.toFixed(7));
      }
      return;
    }

    updateAreaPreview(map, []);
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng) && latitude && longitude) {
      marker.setLngLat([lng, lat]).addTo(map);
    }
  }, [geometryType, latitude, longitude, polygonPoints]);

  useEffect(() => {
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (
      geometryType !== "point" ||
      !mapRef.current ||
      !markerRef.current ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      return;
    }
    markerRef.current.setLngLat([lng, lat]);
    if (!markerRef.current.getElement().isConnected) markerRef.current.addTo(mapRef.current);
  }, [geometryType, latitude, longitude]);

  async function useCurrentLocation() {
    setLocating(true);
    setLocationMessage(null);
    try {
      const location = await requestUserLocation();
      const nextLatitude = location.latitude.toFixed(7);
      const nextLongitude = location.longitude.toFixed(7);
      setLatitude(nextLatitude);
      setLongitude(nextLongitude);
      setAccuracy(location.accuracy?.toString() ?? "");
      mapRef.current?.flyTo({
        center: [location.longitude, location.latitude],
        zoom: 18,
        essential: true,
      });
      setLocationMessage(
        location.accuracy
          ? `Posición GPS capturada con una precisión aproximada de ${Math.round(location.accuracy)} m.`
          : "Posición GPS capturada. Ajusta el marcador si es necesario.",
      );
    } catch (error) {
      setLocationMessage(getUserLocationErrorMessage(error));
    } finally {
      setLocating(false);
    }
  }

  function undoPolygonPoint() {
    const nextPoints = polygonPoints.slice(0, -1);
    polygonPointsRef.current = nextPoints;
    setPolygonPoints(nextPoints);
    if (mapRef.current) updateAreaPreview(mapRef.current, nextPoints);
    setLocationMessage(
      nextPoints.length === 0
        ? "Área vacía. Pulsa sobre el mapa para comenzar."
        : `Último punto eliminado. Quedan ${nextPoints.length}.`,
    );
  }

  function clearPolygon() {
    polygonPointsRef.current = [];
    setPolygonPoints([]);
    if (mapRef.current) updateAreaPreview(mapRef.current, []);
    setLocationMessage("Área eliminada. Pulsa sobre el mapa para dibujarla de nuevo.");
  }

  return (
    <form action={action} className="space-y-6">
      <section className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 shadow-[0_16px_45px_rgba(116,19,20,0.07)] sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#741314]/58">Lugar del mapa</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#381932]">
              {formMode === "edit"
                ? "Editar lugar"
                : formMode === "duplicate"
                  ? "Duplicar lugar"
                  : "Añadir lugar"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#381932]/65">
              {formMode === "duplicate"
                ? "Revisa el nombre y la posición. La copia se guardará como borrador e inactiva."
                : "Completa lo esencial, marca la posición y guarda. Los detalles adicionales son opcionales."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {formMode === "edit" && initialValues?.id ? (
              <>
                {!initialValues.parentPlaceId ? (
                  <Link
                    href={`/panel/lugares/nuevo?parent=${initialValues.id}`}
                    className="inline-flex items-center gap-2 rounded-full bg-[#741314] px-4 py-2 text-sm font-semibold text-[#FFF7E8]"
                  >
                    <MapPin aria-hidden="true" className="h-4 w-4" />
                    Añadir elemento dentro
                  </Link>
                ) : null}
                <Link
                  href={`/panel/lugares/nuevo?copiar=${initialValues.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[#741314]/18 px-4 py-2 text-sm font-semibold text-[#741314]"
                >
                  <Copy aria-hidden="true" className="h-4 w-4" />
                  Duplicar
                </Link>
              </>
            ) : null}
            <Link href="/panel/lugares" className="rounded-full border border-[#741314]/18 px-4 py-2 text-sm font-semibold text-[#741314]">
              Volver
            </Link>
          </div>
        </div>

        {formMode === "edit" && initialValues?.slug ? (
          <AdminPreviewLink
            href={`/mapa?lugar=${encodeURIComponent(initialValues.slug)}`}
            description="Este formulario modifica el punto, su post informativo y las ayudas que aparecen en el mapa público."
            label="Ver lugar en el mapa"
          />
        ) : null}

        {formMode === "duplicate" ? (
          <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            Estás trabajando sobre una copia. Nada se publicará hasta que revises el lugar y cambies su estado.
          </div>
        ) : null}

        <ol className="mt-6 grid gap-2 sm:grid-cols-3">
          {["Nombre y ciudad", "Qué tipo de lugar es", "Dónde está"].map(
            (step, index) => (
              <li
                key={step}
                className="flex items-center gap-3 rounded-xl border border-[#741314]/10 bg-white px-3 py-3 text-sm font-semibold text-[#381932]"
              >
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#741314] text-xs font-bold text-[#FFF7E8]">
                  {index + 1}
                </span>
                {step}
              </li>
            ),
          )}
        </ol>

        <button
          type="button"
          aria-expanded={showAdvanced}
          onClick={() => setShowAdvanced((current) => !current)}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#741314]/18 bg-white px-4 py-2.5 text-sm font-bold text-[#741314] transition hover:bg-[#741314]/[0.05]"
        >
          <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
          {showAdvanced ? "Ocultar opciones avanzadas" : "Mostrar opciones avanzadas"}
        </button>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-[#381932]">Nombre</span>
            <input
              name="name"
              value={name}
              onChange={(event) => {
                const nextName = event.target.value;
                setName(nextName);
                if (!slugEdited) setSlug(toSlug(nextName));
              }}
              className={fieldClassName}
              placeholder="Mesas de la Alameda"
              required
            />
          </label>
          <label className={showAdvanced ? "block" : "hidden"}>
            <span className="text-sm font-semibold text-[#381932]">Identificador URL</span>
            <input
              name="slug"
              value={slug}
              onChange={(event) => {
                setSlug(toSlug(event.target.value));
                setSlugEdited(true);
              }}
              className={fieldClassName}
              placeholder="mesas-alameda"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#381932]">Ciudad</span>
            <select
              name="cityId"
              value={cityId}
              onChange={(event) => {
                setCityId(event.target.value);
                setParentPlaceId("");
              }}
              className={fieldClassName}
              required
            >
              <option value="" disabled>Selecciona una ciudad</option>
              {cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#381932]">Dentro de (opcional)</span>
            <select
              name="parentPlaceId"
              value={parentPlaceId}
              onChange={(event) => setParentPlaceId(event.target.value)}
              className={fieldClassName}
              disabled={!cityId}
            >
              <option value="">Es un lugar principal</option>
              {availableParentPlaces.map((place) => (
                <option key={place.id} value={place.id}>
                  {place.name}
                </option>
              ))}
            </select>
            <span className="mt-2 block text-xs leading-5 text-[#381932]/58">
              Úsalo para mesas, bancos, juegos o zonas deportivas situadas dentro de un parque.
            </span>
          </label>
          <label className={showAdvanced ? "block" : "hidden"}>
            <span className="text-sm font-semibold text-[#381932]">Estado</span>
            <select name="status" defaultValue={initialValues?.status ?? "draft"} className={fieldClassName}>
              <option value="draft">Borrador</option>
              <option value="review">Pendiente de revisión</option>
              <option value="published">Publicado</option>
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-[#381932]">Descripción útil</span>
            <textarea
              name="description"
              defaultValue={initialValues?.description ?? ""}
              className={`${fieldClassName} min-h-24 resize-y`}
              placeholder="Dónde está, cómo se accede y qué encontrará la persona."
            />
          </label>
        </div>
      </section>

      <div className={showAdvanced ? "block" : "hidden"}>
        <AdminFormDisclosure
          title="Historia e información para la visita"
          description="Añádelo solo si el lugar merece una ficha editorial propia."
          defaultOpen
        >
          <div className="grid gap-5 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-[#381932]">Imagen principal</span>
            <input
              name="coverImageUrl"
              defaultValue={initialValues?.coverImageUrl ?? ""}
              className={fieldClassName}
              placeholder="https://... o /ruta-del-proyecto.webp"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-[#381932]">Relato breve</span>
            <textarea
              name="story"
              defaultValue={initialValues?.story ?? ""}
              className={`${fieldClassName} min-h-32 resize-y`}
              placeholder="Cuenta por qué merece la pena detenerse aquí. Usa información contrastada y un tono cercano."
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#381932]">Horario o disponibilidad</span>
            <input
              name="openingHoursNote"
              defaultValue={initialValues?.openingHoursNote ?? ""}
              className={fieldClassName}
              placeholder="Espacio exterior, acceso libre"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#381932]">Accesibilidad</span>
            <input
              name="accessibilityNote"
              defaultValue={initialValues?.accessibilityNote ?? ""}
              className={fieldClassName}
              placeholder="Acceso a nivel desde..."
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#381932]">Nombre de la fuente</span>
            <input
              name="sourceLabel"
              defaultValue={initialValues?.sourceLabel ?? ""}
              className={fieldClassName}
              placeholder="Turismo de Talavera"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#381932]">Enlace oficial</span>
            <input
              name="sourceUrl"
              defaultValue={initialValues?.sourceUrl ?? ""}
              className={fieldClassName}
              placeholder="https://..."
              inputMode="url"
            />
          </label>
          </div>
        </AdminFormDisclosure>
      </div>

      <section className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-7">
        <label className="block max-w-xl">
          <span className="text-sm font-semibold text-[#381932]">Tipo de lugar</span>
          <div className="mt-2 grid grid-cols-[3.25rem_minmax(0,1fr)] items-center gap-3">
            <span
              className="inline-flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-xl bg-[#741314] text-[#FFF7E8]"
              title={`Icono: ${selectedCategoryConfig?.label ?? "Lugar"}`}
            >
              <MapPlaceIcon name={selectedCategoryConfig?.iconName ?? "MapPin"} className="h-6 w-6" />
            </span>
            <select
              name="category"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className={`${fieldClassName} !mt-0`}
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <span className="mt-2 block text-xs leading-5 text-[#381932]/58">
            La vista previa muestra el icono exacto que aparecerá en el mapa.
          </span>
        </label>
      </section>

      <div className={showAdvanced ? "block" : "hidden"}>
        <AdminFormDisclosure
          eyebrow="Planes"
          title="Usar en una ruta corta"
          description="Configura si puede combinarse con un local cercano dentro de un plan Pickyalo."
          defaultOpen
        >
          <div className="mb-5 flex items-center gap-3 text-sm font-semibold text-[#741314]">
            <Route className="h-5 w-5" aria-hidden="true" />
            Solo aparecerá si está activo, publicado y marcado como candidato.
          </div>
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:items-end">
          <label className="block">
            <span className="text-sm font-semibold text-[#381932]">Papel del lugar</span>
            <select name="planRole" defaultValue={initialValues?.planRole ?? "support"} className={fieldClassName}>
              <option value="discover">Descubrir · patrimonio, mural o evento</option>
              <option value="enjoy">Disfrutar · parque, mesa o mirador</option>
              <option value="support">Apoyo · servicio útil</option>
            </select>
          </label>
          <label className="flex min-h-[3.25rem] items-center gap-3 rounded-xl border border-[#741314]/16 bg-white px-4 py-3 text-sm text-[#381932]">
            <input
              name="isPlanCandidate"
              type="checkbox"
              defaultChecked={initialValues?.isPlanCandidate ?? false}
              className="h-4 w-4 accent-[#741314]"
            />
            <span>
              <strong className="block font-semibold">Puede aparecer en planes</strong>
              <span className="mt-0.5 block text-xs leading-5 text-[#381932]/58">Actívalo solo después de revisar ubicación y contenido.</span>
            </span>
          </label>
          </div>
        </AdminFormDisclosure>
      </div>

      <section className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[#381932]">
              {geometryType === "polygon" ? "Delimitar el área" : "Posición exacta"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#381932]/62">
              {geometryType === "polygon"
                ? "Pulsa alrededor del perímetro. Tú decides cada vértice y el sistema calculará el centro."
                : "Pulsa en el mapa, arrastra el marcador o guarda tu posición cuando estés en el lugar."}
            </p>
          </div>
          {geometryType === "point" ? (
            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={locating}
              className="inline-flex items-center gap-2 rounded-full bg-[#741314] px-4 py-2.5 text-sm font-semibold text-[#FFF7E8] disabled:opacity-55"
            >
              <LocateFixed className="h-4 w-4" aria-hidden="true" />
              {locating ? "Localizando..." : "Usar mi ubicación"}
            </button>
          ) : null}
        </div>

        <div className="mt-5 grid gap-2 rounded-2xl border border-[#741314]/12 bg-white p-2 sm:grid-cols-2">
          <button
            type="button"
            aria-pressed={geometryType === "point"}
            onClick={() => setGeometryType("point")}
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition ${
              geometryType === "point"
                ? "bg-[#741314] text-[#FFF7E8]"
                : "text-[#741314] hover:bg-[#741314]/[0.05]"
            }`}
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Marcar un punto
          </button>
          <button
            type="button"
            aria-pressed={geometryType === "polygon"}
            onClick={() => setGeometryType("polygon")}
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition ${
              geometryType === "polygon"
                ? "bg-[#741314] text-[#FFF7E8]"
                : "text-[#741314] hover:bg-[#741314]/[0.05]"
            }`}
          >
            <Pentagon className="h-4 w-4" aria-hidden="true" />
            Delimitar un área
          </button>
        </div>

        <input type="hidden" name="geometryType" value={geometryType} />
        <input
          type="hidden"
          name="geometry"
          value={
            geometryType === "polygon"
              ? JSON.stringify(createPolygonGeometry(polygonPoints))
              : ""
          }
        />

        {accessToken ? (
          <div ref={mapContainerRef} className="mt-5 h-[420px] overflow-hidden rounded-xl border border-[#741314]/14 bg-[#eadfca]" />
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-[#741314]/25 bg-white p-5 text-sm text-[#381932]/65">
            Configura `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` para usar el selector visual. Puedes introducir las coordenadas manualmente.
          </div>
        )}

        {geometryType === "polygon" ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#741314]/12 bg-white px-4 py-3">
            <p className="text-sm font-semibold text-[#381932]" aria-live="polite">
              {polygonPoints.length < 3
                ? `${polygonPoints.length}/3 puntos mínimos`
                : `${polygonPoints.length} puntos · área lista para guardar`}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={undoPolygonPoint}
                disabled={polygonPoints.length === 0}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#741314]/18 px-3.5 text-sm font-semibold text-[#741314] disabled:opacity-40"
              >
                <Undo2 className="h-4 w-4" aria-hidden="true" />
                Deshacer
              </button>
              <button
                type="button"
                onClick={clearPolygon}
                disabled={polygonPoints.length === 0}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#741314]/18 px-3.5 text-sm font-semibold text-[#741314] disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Limpiar
              </button>
            </div>
          </div>
        ) : null}

        {showAdvanced || !accessToken ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="text-sm font-semibold text-[#381932]">Latitud</span>
              <input name="latitude" value={latitude} onChange={(event) => setLatitude(event.target.value)} className={fieldClassName} required inputMode="decimal" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#381932]">Longitud</span>
              <input name="longitude" value={longitude} onChange={(event) => setLongitude(event.target.value)} className={fieldClassName} required inputMode="decimal" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#381932]">Precisión GPS (m)</span>
              <input name="locationAccuracyM" value={accuracy} onChange={(event) => setAccuracy(event.target.value)} className={fieldClassName} inputMode="decimal" />
            </label>
          </div>
        ) : (
          <>
            <input type="hidden" name="latitude" value={latitude} />
            <input type="hidden" name="longitude" value={longitude} />
            <input type="hidden" name="locationAccuracyM" value={accuracy} />
            <p className="mt-4 text-sm font-medium text-[#381932]/65">
              {geometryType === "polygon"
                ? polygonPoints.length >= 3
                  ? "El punto central se calcula automáticamente a partir del área."
                  : "Pulsa alrededor del perímetro para completar el área."
                : latitude && longitude
                  ? "Posición marcada. Puedes ajustarla directamente sobre el mapa."
                  : "Pulsa sobre el mapa para marcar la posición exacta."}
            </p>
          </>
        )}
        {locationMessage ? (
          <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-[#741314]" aria-live="polite">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {locationMessage}
          </p>
        ) : null}
      </section>

      <div className={showAdvanced ? "block" : "hidden"}>
        <AdminFormDisclosure
          eyebrow="Control"
          title="Revisión y servicios"
          description="Guarda la fuente, el orden y los servicios concretos después de comprobar el punto."
          defaultOpen
        >
          <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-[#381932]">Cómo se comprobó</span>
            <select name="source" defaultValue={initialValues?.source ?? "field"} className={fieldClassName}>
              <option value="field">Comprobación sobre el terreno</option>
              <option value="municipal">Fuente municipal</option>
              <option value="openstreetmap">OpenStreetMap</option>
              <option value="manual">Marcado manual</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#381932]">Orden visual</span>
            <input name="sortOrder" defaultValue={initialValues?.sortOrder ?? "0"} className={fieldClassName} type="number" min="0" />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-[#381932]">Nota de verificación</span>
            <input name="sourceNote" defaultValue={initialValues?.sourceNote ?? ""} className={fieldClassName} placeholder="Comprobado in situ el 3 de agosto" />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-[#381932]">Servicios concretos</span>
            <input name="amenities" defaultValue={initialValues?.amenities ?? ""} className={fieldClassName} placeholder="6 mesas, sombra, fuente cercana (separados por comas)" />
          </label>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <label className="inline-flex items-center gap-2 rounded-full border border-[#741314]/16 bg-white px-4 py-2.5 text-sm font-semibold text-[#381932]">
            <input name="isAccessible" type="checkbox" defaultChecked={initialValues?.isAccessible ?? false} className="accent-[#741314]" />
            Acceso adaptado
          </label>
          <label className="inline-flex items-center gap-2 rounded-full border border-[#741314]/16 bg-white px-4 py-2.5 text-sm font-semibold text-[#381932]">
            <input name="isActive" type="checkbox" defaultChecked={initialValues?.isActive ?? true} className="accent-[#741314]" />
            Punto activo
          </label>
          </div>
        </AdminFormDisclosure>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="rounded-full bg-[#741314] px-6 py-3.5 text-sm font-bold text-[#FFF7E8] shadow-[0_12px_28px_rgba(116,19,20,0.2)]">
          {formMode === "edit"
            ? "Guardar cambios"
            : formMode === "duplicate"
              ? "Crear copia"
              : "Crear lugar"}
        </button>
      </div>
    </form>
  );
}
