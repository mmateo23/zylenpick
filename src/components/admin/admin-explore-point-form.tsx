"use client";

import { Save } from "lucide-react";
import { useMemo, useState } from "react";

import { AdminExploreMediaField } from "@/components/admin/admin-explore-media-field";
import type {
  AdminExplorePoint,
  AdminExploreSponsor,
  ExplorePlaceOption,
} from "@/features/admin/services/explore-admin-service";

type Props = {
  routeId: string;
  routeCityId: string;
  point: AdminExplorePoint | null;
  places: ExplorePlaceOption[];
  sponsors: AdminExploreSponsor[];
  nextPosition: number;
  action: (formData: FormData) => void;
};

const fieldClassName =
  "mt-2 min-h-11 w-full rounded-xl border border-[#741314]/16 bg-white px-3.5 py-3 text-sm text-[#381932] outline-none placeholder:text-[#381932]/38 focus:border-[#741314] focus:ring-2 focus:ring-[#741314]/10";

function toSlug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function AdminExplorePointForm({
  routeId,
  routeCityId,
  point,
  places,
  sponsors,
  nextPosition,
  action,
}: Props) {
  const routePlaces = useMemo(() => places.filter((place) => place.cityId === routeCityId), [places, routeCityId]);
  const [mapPlaceId, setMapPlaceId] = useState(point?.mapPlaceId ?? "");
  const [title, setTitle] = useState(point?.title ?? "");
  const [slug, setSlug] = useState(point?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(point?.slug));
  const selectedPlace = routePlaces.find((place) => place.id === mapPlaceId);
  const [latitude, setLatitude] = useState(point?.latitude ?? "");
  const [longitude, setLongitude] = useState(point?.longitude ?? "");

  function selectPlace(id: string) {
    setMapPlaceId(id);
    const place = routePlaces.find((item) => item.id === id);
    if (!place) return;
    if (!title) setTitle(place.name);
    if (!slugTouched) setSlug(toSlug(place.name));
    if (!latitude && place.latitude !== null) setLatitude(String(place.latitude));
    if (!longitude && place.longitude !== null) setLongitude(String(place.longitude));
  }

  return (
    <form action={action} className="space-y-5 pb-24">
      <section className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#741314]/58">Parada</p>
        <h2 className="mt-2 text-xl font-semibold text-[#381932]">Lugar, orden y estado</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-[#381932] sm:col-span-2">
            Punto de interés asociado
            <select name="mapPlaceId" value={mapPlaceId} onChange={(event) => selectPlace(event.target.value)} required className={fieldClassName}>
              <option value="">Selecciona un lugar</option>
              {routePlaces.map((place) => <option key={place.id} value={place.id}>{place.name} · {place.category}{place.status === "published" && place.isActive ? "" : " · no publicado"}</option>)}
            </select>
            {selectedPlace && (selectedPlace.status !== "published" || !selectedPlace.isActive) ? <span className="mt-2 block text-xs font-semibold text-amber-800">Puedes preparar la parada, pero no publicarla hasta publicar el lugar.</span> : null}
          </label>
          <label className="text-sm font-semibold text-[#381932]">
            Título
            <input name="title" value={title} onChange={(event) => { setTitle(event.target.value); if (!slugTouched) setSlug(toSlug(event.target.value)); }} autoCapitalize="sentences" required className={fieldClassName} />
          </label>
          <label className="text-sm font-semibold text-[#381932]">
            Slug
            <input name="slug" value={slug} onChange={(event) => { setSlugTouched(true); setSlug(toSlug(event.target.value)); }} required className={fieldClassName} />
          </label>
          <label className="text-sm font-semibold text-[#381932]">
            Posición
            <input name="position" type="number" inputMode="numeric" min="1" defaultValue={point?.position ?? String(nextPosition)} required className={fieldClassName} />
          </label>
          <label className="text-sm font-semibold text-[#381932]">
            Patrocinador de esta parada
            <select name="sponsorId" defaultValue={point?.sponsorId ?? ""} className={fieldClassName}>
              <option value="">Usar el de la ruta o ninguno</option>
              {sponsors.map((sponsor) => <option key={sponsor.id} value={sponsor.id}>{sponsor.name}{sponsor.isActive ? "" : " · inactivo"}</option>)}
            </select>
          </label>
          <label className="flex min-h-11 items-center gap-3 rounded-xl border border-[#741314]/12 bg-white px-4 text-sm font-semibold text-[#381932]">
            <input name="isActive" type="checkbox" defaultChecked={point?.isActive ?? true} className="h-5 w-5 accent-[#741314]" /> Activa
          </label>
          <label className="flex min-h-11 items-center gap-3 rounded-xl border border-[#741314]/12 bg-white px-4 text-sm font-semibold text-[#381932]">
            <input name="isPublished" type="checkbox" defaultChecked={point?.isPublished ?? false} className="h-5 w-5 accent-[#741314]" /> Publicada
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-7">
        <h2 className="text-xl font-semibold text-[#381932]">Historia accesible</h2>
        <div className="mt-5 space-y-5">
          <label className="block text-sm font-semibold text-[#381932]">Introducción corta<textarea name="introduction" defaultValue={point?.introduction} rows={3} className={fieldClassName} /></label>
          <label className="block text-sm font-semibold text-[#381932]">Relato completo<textarea name="story" defaultValue={point?.story} rows={9} className={fieldClassName} /></label>
          <label className="block text-sm font-semibold text-[#381932]">Transcripción<textarea name="transcript" defaultValue={point?.transcript} rows={12} className={fieldClassName} /></label>
        </div>
      </section>

      <AdminExploreMediaField name="imageUrl" label="Fotografía principal" description="Fotografía documental de la parada. Se optimiza a WebP." kind="photo" scopeId={point?.id ?? routeId} initialUrl={point?.imageUrl} />
      <section className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-7">
        <label className="block text-sm font-semibold text-[#381932]">Texto alternativo de la fotografía<input name="imageAlt" defaultValue={point?.imageAlt} className={fieldClassName} /></label>
      </section>
      <AdminExploreMediaField name="audioUrl" label="Historia narrada" description="MP3, M4A, OGG, WAV o WebM. Máximo 30 MB." kind="audio" scopeId={point?.id ?? routeId} initialUrl={point?.audioUrl} />
      <section className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-7">
        <label className="block text-sm font-semibold text-[#381932]">Duración del audio en segundos<input name="audioDurationSeconds" type="number" inputMode="numeric" min="0" defaultValue={point?.audioDurationSeconds} className={fieldClassName} /></label>
      </section>
      <AdminExploreMediaField name="artisticMapUrl" label="Mapa artístico" description="Archivo terminado de PrettyMaps u otra fuente editorial. PNG, WebP, JPEG o SVG simple." kind="map" scopeId={point?.id ?? routeId} initialUrl={point?.artisticMapUrl} />

      <section className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-7">
        <h2 className="text-xl font-semibold text-[#381932]">Ubicación y créditos</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-[#381932]">Latitud<input name="latitude" inputMode="decimal" value={latitude} onChange={(event) => setLatitude(event.target.value)} className={fieldClassName} /></label>
          <label className="text-sm font-semibold text-[#381932]">Longitud<input name="longitude" inputMode="decimal" value={longitude} onChange={(event) => setLongitude(event.target.value)} className={fieldClassName} /></label>
          <label className="text-sm font-semibold text-[#381932] sm:col-span-2">Créditos<textarea name="credits" defaultValue={point?.credits} rows={4} className={fieldClassName} placeholder="Fotografía, narración, fuentes, PrettyMaps y OpenStreetMap..." /></label>
        </div>
      </section>

      <div className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl border border-[#741314]/16 bg-[#FFF7E8]/95 p-3 shadow-[0_18px_55px_rgba(36,17,14,0.18)] backdrop-blur sm:inset-x-auto sm:right-6">
        <p className="hidden text-xs font-medium text-[#381932]/62 sm:block">Los campos incompletos pueden guardarse como borrador.</p>
        <button type="submit" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#741314] px-5 text-sm font-bold text-[#FFF7E8] sm:w-auto"><Save aria-hidden="true" className="h-4 w-4" /> Guardar parada</button>
      </div>
    </form>
  );
}
