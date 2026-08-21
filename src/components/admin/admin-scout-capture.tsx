"use client";

import Link from "next/link";
import {
  Camera,
  Check,
  ChevronDown,
  ImagePlus,
  LoaderCircle,
  LocateFixed,
  MapPin,
  RotateCcw,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  createScoutDraftAction,
  discardScoutUploadAction,
  prepareScoutUploadAction,
} from "@/features/admin/services/scout-admin-service";
import type { MapPlaceCityOption } from "@/features/admin/services/map-places-admin-service";
import type { MapPlaceCategoryDefinition } from "@/features/map-places/categories";
import { MapPlaceIcon } from "@/features/map-places/icons";
import { processScoutImage } from "@/features/scout/process-scout-image";

type AdminScoutCaptureProps = {
  cities: MapPlaceCityOption[];
  categories: MapPlaceCategoryDefinition[];
};

type LocationState = "idle" | "loading" | "ready" | "error";

const inputClassName =
  "mt-2 min-h-12 w-full rounded-xl border border-[#741314]/16 bg-white px-4 text-base text-[#381932] outline-none transition placeholder:text-[#381932]/35 focus:border-[#741314]/55 focus:ring-2 focus:ring-[#741314]/10";

async function uploadScoutFile(signedUrl: string, file: File) {
  const body = new FormData();
  body.append("cacheControl", "31536000");
  body.append("", file, file.name);
  const response = await fetch(signedUrl, {
    method: "PUT",
    headers: { "x-upsert": "false" },
    body,
  });
  if (!response.ok) throw new Error("Supabase Storage rechazó la subida.");
}

export function AdminScoutCapture({ cities, categories }: AdminScoutCaptureProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const requestedLocationRef = useRef(false);
  const [cityId, setCityId] = useState(cities[0]?.id ?? "");
  const [category, setCategory] = useState("");
  const [accessType, setAccessType] = useState<"free" | "restricted" | "unknown">(
    "unknown",
  );
  const [processedImage, setProcessedImage] = useState<File | null>(null);
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageProgress, setImageProgress] = useState(0);
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [accuracy, setAccuracy] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const selectedCategory = categories.find((item) => item.value === category);

  const requestLocation = useCallback(() => {
    setLocationError(null);
    if (!("geolocation" in navigator)) {
      setLocationState("error");
      setLocationError("Este dispositivo no ofrece ubicación. Puedes guardar y completarla después.");
      return;
    }

    setLocationState("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(7));
        setLongitude(position.coords.longitude.toFixed(7));
        setAccuracy(Math.round(position.coords.accuracy).toString());
        setLocationState("ready");
      },
      (error) => {
        setLocationState("error");
        const message =
          error.code === error.PERMISSION_DENIED
            ? "No has permitido la ubicación. Puedes reintentar o guardar sin ella."
            : "No se pudo obtener una posición fiable. Puedes reintentar o completarla después.";
        setLocationError(message);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 15000 },
    );
  }, []);

  useEffect(() => {
    if (requestedLocationRef.current) return;
    requestedLocationRef.current = true;
    requestLocation();
    const savedCategory = window.sessionStorage.getItem("pickyalo.scout.last-category");
    if (savedCategory && categories.some((item) => item.value === savedCategory)) {
      setCategory(savedCategory);
    }
  }, [categories, requestLocation]);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  async function handleImage(file: File | undefined) {
    if (!file) return;
    setImageError(null);
    setImageProgress(15);
    try {
      const result = await processScoutImage(file);
      setImageProgress(45);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setProcessedImage(result.cover);
      setThumbnailImage(result.thumbnail);
      setPreviewUrl(URL.createObjectURL(result.cover));
      setImageProgress(50);
    } catch (error) {
      setProcessedImage(null);
      setThumbnailImage(null);
      setImageProgress(0);
      setImageError(error instanceof Error ? error.message : "No se pudo procesar la foto.");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    if (!processedImage || !thumbnailImage) {
      setImageError("Haz una foto o elige una imagen antes de guardar.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setImageProgress(65);
    const ticket = await prepareScoutUploadAction();
    if (!ticket.ok) {
      setSubmitError(ticket.error);
      setImageProgress(50);
      setSubmitting(false);
      return;
    }

    setImageProgress(72);
    try {
      await uploadScoutFile(ticket.uploads.cover.signedUrl, processedImage);
    } catch (error) {
      await discardScoutUploadAction(ticket.id);
      setSubmitError(error instanceof Error ? error.message : "No se pudo subir la foto.");
      setImageProgress(50);
      setSubmitting(false);
      return;
    }

    setImageProgress(84);
    try {
      await uploadScoutFile(ticket.uploads.thumbnail.signedUrl, thumbnailImage);
    } catch (error) {
      await discardScoutUploadAction(ticket.id);
      setSubmitError(error instanceof Error ? error.message : "No se pudo subir la miniatura.");
      setImageProgress(50);
      setSubmitting(false);
      return;
    }

    setImageProgress(92);
    const formData = new FormData(event.currentTarget);
    formData.set("uploadId", ticket.id);
    const result = await createScoutDraftAction(formData);
    if (!result.ok) {
      setSubmitError(result.error);
      setImageProgress(50);
      setSubmitting(false);
      return;
    }
    setImageProgress(100);
    setSavedId(result.id);
    setSubmitting(false);
  }

  function resetCapture() {
    formRef.current?.reset();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setProcessedImage(null);
    setThumbnailImage(null);
    setImageError(null);
    setImageProgress(0);
    setLatitude("");
    setLongitude("");
    setAccuracy("");
    setLocationState("idle");
    setLocationError(null);
    setAccessType("unknown");
    setSubmitError(null);
    setSavedId(null);
    requestedLocationRef.current = true;
    requestLocation();
  }

  if (savedId) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-emerald-200 bg-white p-6 shadow-[0_22px_60px_rgba(56,25,50,0.08)] sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Check aria-hidden="true" className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-2xl font-semibold text-[#381932]">Captura guardada</h2>
        <p className="mt-2 text-sm leading-6 text-[#381932]/65">
          Se ha creado como pendiente. No aparecerá en el mapa hasta que completes y publiques su ficha.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={resetCapture}
            className="min-h-12 rounded-full bg-[#741314] px-4 text-sm font-bold text-[#FFF7E8]"
          >
            Capturar otro
          </button>
          <Link
            href={`/panel/lugares/${savedId}`}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#741314]/22 px-4 text-center text-sm font-bold text-[#741314]"
          >
            Completar ahora
          </Link>
          <Link
            href="/panel/lugares?estado=pending"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#741314]/22 px-4 text-center text-sm font-bold text-[#741314]"
          >
            Ver pendientes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="mx-auto max-w-2xl pb-28">
      <input type="hidden" name="latitude" value={latitude} />
      <input type="hidden" name="longitude" value={longitude} />
      <input type="hidden" name="locationAccuracyM" value={accuracy} />
      <input type="hidden" name="accessType" value={accessType} />

      <div className="space-y-4">
        <section className="overflow-hidden rounded-3xl border border-[#741314]/12 bg-[#FFF7E8] shadow-[0_20px_55px_rgba(56,25,50,0.07)]">
          <div className="relative aspect-[4/3] bg-[#F7E7D1]">
            {previewUrl ? (
              // A local object URL is intentionally used before the file reaches Storage.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Vista previa de la captura" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center text-[#741314]">
                <Camera aria-hidden="true" className="h-10 w-10" />
                <p className="mt-3 text-base font-bold">Empieza por la foto</p>
                <p className="mt-1 text-sm text-[#381932]/58">Se optimizará antes de subirla.</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 p-4">
            <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#741314] px-4 text-sm font-bold text-[#FFF7E8]">
              <Camera aria-hidden="true" className="h-5 w-5" />
              Hacer foto
              <input
                type="file"
                accept="image/*,.heic,.heif"
                capture="environment"
                className="sr-only"
                onChange={(event) => void handleImage(event.target.files?.[0])}
              />
            </label>
            <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#741314]/22 bg-white px-4 text-sm font-bold text-[#741314]">
              <ImagePlus aria-hidden="true" className="h-5 w-5" />
              Galería
              <input
                type="file"
                accept="image/*,.heic,.heif"
                className="sr-only"
                onChange={(event) => void handleImage(event.target.files?.[0])}
              />
            </label>
          </div>
          {imageProgress > 0 ? (
            <div className="px-4 pb-4" aria-live="polite">
              <div className="h-1.5 overflow-hidden rounded-full bg-[#741314]/10">
                <div className="h-full rounded-full bg-[#741314] transition-[width]" style={{ width: `${imageProgress}%` }} />
              </div>
              <p className="mt-2 text-xs font-semibold text-[#381932]/60">
                {submitting
                  ? "Subiendo y guardando..."
                  : processedImage
                    ? `WebP listo · ${Math.ceil(processedImage.size / 1024)} KB`
                    : "Procesando imagen..."}
              </p>
            </div>
          ) : null}
          {imageError ? <p className="px-4 pb-4 text-sm font-semibold text-red-700">{imageError}</p> : null}
        </section>

        <section className="rounded-3xl border border-[#741314]/12 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#741314]/60">Ubicación</p>
              <p className="mt-2 text-base font-semibold text-[#381932]" aria-live="polite">
                {locationState === "loading"
                  ? "Obteniendo posición..."
                  : locationState === "ready"
                    ? `GPS listo · precisión aproximada ${accuracy} m`
                    : "Ubicación pendiente"}
              </p>
            </div>
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${locationState === "ready" ? "bg-emerald-100 text-emerald-700" : "bg-[#FFE9EC] text-[#741314]"}`}>
              {locationState === "loading" ? (
                <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" />
              ) : (
                <MapPin aria-hidden="true" className="h-5 w-5" />
              )}
            </div>
          </div>
          {locationError ? <p className="mt-3 text-sm leading-6 text-[#741314]">{locationError}</p> : null}
          {locationState !== "ready" ? (
            <button
              type="button"
              onClick={requestLocation}
              disabled={locationState === "loading"}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#741314]/20 px-4 text-sm font-bold text-[#741314] disabled:opacity-50"
            >
              <LocateFixed aria-hidden="true" className="h-4 w-4" />
              Reintentar GPS
            </button>
          ) : null}
        </section>

        {cities.length > 1 ? (
          <label className="block rounded-3xl border border-[#741314]/12 bg-white p-5">
            <span className="text-sm font-semibold text-[#381932]">Ciudad</span>
            <select name="cityId" value={cityId} onChange={(event) => setCityId(event.target.value)} className={inputClassName} required>
              {cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
            </select>
          </label>
        ) : (
          <input type="hidden" name="cityId" value={cityId} />
        )}

        <details className="group rounded-3xl border border-[#741314]/12 bg-[#FFF7E8] p-5">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-bold text-[#741314] [&::-webkit-details-marker]:hidden">
            <span>+ Añadir detalles ahora</span>
            <ChevronDown aria-hidden="true" className="h-5 w-5 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-5 space-y-5 border-t border-[#741314]/10 pt-5">
            <label className="block">
              <span className="text-sm font-semibold text-[#381932]">Nombre provisional</span>
              <input name="name" className={inputClassName} maxLength={140} autoCapitalize="words" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#381932]">Categoría</span>
              <select
                name="category"
                value={category}
                onChange={(event) => {
                  const value = event.target.value;
                  setCategory(value);
                  if (value) window.sessionStorage.setItem("pickyalo.scout.last-category", value);
                }}
                className={inputClassName}
              >
                <option value="">Pendiente</option>
                {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
              {selectedCategory ? (
                <span className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#741314]/14 bg-white px-4 text-sm font-semibold text-[#381932]">
                  <MapPlaceIcon name={selectedCategory.iconName} aria-hidden="true" className="h-5 w-5 text-[#741314]" />
                  {selectedCategory.label}
                </span>
              ) : null}
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#381932]">Nota rápida</span>
              <textarea name="note" rows={3} maxLength={600} className={`${inputClassName} py-3`} placeholder="Algo que convenga revisar después" />
            </label>
            <fieldset>
              <legend className="text-sm font-semibold text-[#381932]">Acceso</legend>
              <div className="mt-2 grid grid-cols-3 gap-2 rounded-2xl border border-[#741314]/12 bg-white p-1.5">
                {[
                  ["free", "Libre"],
                  ["restricted", "Restringido"],
                  ["unknown", "No sé"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={accessType === value}
                    onClick={() => setAccessType(value as typeof accessType)}
                    className={`min-h-11 rounded-xl px-2 text-xs font-bold ${accessType === value ? "bg-[#741314] text-[#FFF7E8]" : "text-[#381932]/65"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="block">
              <span className="text-sm font-semibold text-[#381932]">Disponibilidad u horario</span>
              <input name="availability" className={inputClassName} maxLength={260} placeholder="Si lo conoces" />
            </label>
          </div>
        </details>

        {submitError ? (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {submitError}
          </div>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#741314]/12 bg-[#FFF7E8]/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="hidden min-w-0 flex-1 sm:block">
            <p className="truncate text-sm font-semibold text-[#381932]">
              {processedImage ? "Foto lista" : "Falta la foto"} · {locationState === "ready" ? "GPS listo" : "GPS opcional"}
            </p>
          </div>
          <button
            type="submit"
            disabled={submitting || !processedImage || !cityId}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#741314] px-6 text-sm font-bold text-[#FFF7E8] shadow-[0_12px_28px_rgba(116,19,20,0.18)] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
          >
            {submitting ? <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" /> : <RotateCcw aria-hidden="true" className="h-5 w-5" />}
            {submitting ? "Guardando..." : "Guardar y seguir"}
          </button>
        </div>
      </div>
    </form>
  );
}
