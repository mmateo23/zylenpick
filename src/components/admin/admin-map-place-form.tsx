"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Map as MapboxMap, Marker } from "mapbox-gl";
import { LocateFixed, MapPin } from "lucide-react";

import { mapPlaceCategories } from "@/features/map-places/categories";
import type {
  AdminMapPlaceFormValues,
  MapPlaceCityOption,
} from "@/features/admin/services/map-places-admin-service";
import {
  getUserLocationErrorMessage,
  requestUserLocation,
} from "@/features/location/browser-location";

type AdminMapPlaceFormProps = {
  accessToken: string;
  cities: MapPlaceCityOption[];
  action: (formData: FormData) => void;
  initialValues?: AdminMapPlaceFormValues | null;
};

const defaultCenter: [number, number] = [-4.8308, 39.9579];
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

function CategoryIcon({ path }: { path: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      dangerouslySetInnerHTML={{ __html: path }}
    />
  );
}

export function AdminMapPlaceForm({
  accessToken,
  cities,
  action,
  initialValues,
}: AdminMapPlaceFormProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const [name, setName] = useState(initialValues?.name ?? "");
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(initialValues?.slug));
  const [latitude, setLatitude] = useState(initialValues?.latitude ?? "");
  const [longitude, setLongitude] = useState(initialValues?.longitude ?? "");
  const [accuracy, setAccuracy] = useState(initialValues?.locationAccuracyM ?? "");
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

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
      map.on("click", (event) => {
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
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!mapRef.current || !markerRef.current || !Number.isFinite(lat) || !Number.isFinite(lng)) return;
    markerRef.current.setLngLat([lng, lat]);
    if (!markerRef.current.getElement().isConnected) markerRef.current.addTo(mapRef.current);
  }, [latitude, longitude]);

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

  return (
    <form action={action} className="space-y-6">
      <section className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 shadow-[0_16px_45px_rgba(116,19,20,0.07)] sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#741314]/58">Lugar del mapa</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#381932]">
              {initialValues ? "Editar punto" : "Añadir punto"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#381932]/65">
              Marca el lugar sobre el terreno. Guárdalo como borrador hasta comprobar la posición.
            </p>
          </div>
          <Link href="/panel/lugares" className="rounded-full border border-[#741314]/18 px-4 py-2 text-sm font-semibold text-[#741314]">
            Volver
          </Link>
        </div>

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
          <label className="block">
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
            <select name="cityId" defaultValue={initialValues?.cityId ?? ""} className={fieldClassName} required>
              <option value="" disabled>Selecciona una ciudad</option>
              {cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
            </select>
          </label>
          <label className="block">
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

      <section className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-7">
        <h2 className="text-xl font-semibold text-[#381932]">Qué hay aquí</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {mapPlaceCategories.map((category) => (
            <label key={category.value} className="cursor-pointer">
              <input
                type="radio"
                name="category"
                value={category.value}
                defaultChecked={(initialValues?.category ?? "park") === category.value}
                className="peer sr-only"
              />
              <span className="flex min-h-20 flex-col justify-between rounded-xl border border-[#741314]/12 bg-white p-3 text-[#381932]/65 transition peer-checked:border-[#741314] peer-checked:bg-[#741314] peer-checked:text-[#FFF7E8] peer-focus-visible:ring-2 peer-focus-visible:ring-[#741314]/30">
                <CategoryIcon path={category.markerPath} />
                <span className="mt-2 text-xs font-semibold leading-4">{category.label}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[#381932]">Posición exacta</h2>
            <p className="mt-2 text-sm leading-6 text-[#381932]/62">Pulsa en el mapa, arrastra el marcador o guarda tu posición cuando estés en el lugar.</p>
          </div>
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={locating}
            className="inline-flex items-center gap-2 rounded-full bg-[#741314] px-4 py-2.5 text-sm font-semibold text-[#FFF7E8] disabled:opacity-55"
          >
            <LocateFixed className="h-4 w-4" aria-hidden="true" />
            {locating ? "Localizando..." : "Usar mi ubicación"}
          </button>
        </div>

        {accessToken ? (
          <div ref={mapContainerRef} className="mt-5 h-[420px] overflow-hidden rounded-xl border border-[#741314]/14 bg-[#eadfca]" />
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-[#741314]/25 bg-white p-5 text-sm text-[#381932]/65">
            Configura `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` para usar el selector visual. Puedes introducir las coordenadas manualmente.
          </div>
        )}

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
        {locationMessage ? (
          <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-[#741314]" aria-live="polite">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {locationMessage}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-7">
        <h2 className="text-xl font-semibold text-[#381932]">Revisión y detalles</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
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
      </section>

      <div className="flex justify-end">
        <button type="submit" className="rounded-full bg-[#741314] px-6 py-3.5 text-sm font-bold text-[#FFF7E8] shadow-[0_12px_28px_rgba(116,19,20,0.2)]">
          {initialValues ? "Guardar cambios" : "Crear lugar"}
        </button>
      </div>
    </form>
  );
}
