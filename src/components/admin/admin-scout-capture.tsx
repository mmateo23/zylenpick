"use client";

import Link from "next/link";
import {
  Building2,
  Camera,
  Check,
  ChevronDown,
  Compass,
  ImagePlus,
  LoaderCircle,
  LocateFixed,
  MapPin,
  RotateCcw,
  Utensils,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  createScoutDraftAction,
  discardScoutUploadAction,
  prepareScoutUploadAction,
  type ScoutCaptureType,
  type ScoutVenueOption,
} from "@/features/admin/services/scout-admin-service";
import type { MapPlaceCityOption } from "@/features/admin/services/map-places-admin-service";
import type { MapPlaceCategoryDefinition } from "@/features/map-places/categories";
import { MapPlaceIcon } from "@/features/map-places/icons";
import { processScoutImage } from "@/features/scout/process-scout-image";
import { menuItemAllergenOptions } from "@/features/venues/allergens";
import type { MenuItemAllergen } from "@/features/venues/types";

type AdminScoutCaptureProps = {
  cities: MapPlaceCityOption[];
  categories: MapPlaceCategoryDefinition[];
  venues: ScoutVenueOption[];
  initialType?: ScoutCaptureType;
  initialVenueId?: string;
};

type LocationState = "idle" | "loading" | "ready" | "error";
type ScoutProgressState =
  | "processing"
  | "ready"
  | "uploading"
  | "saving"
  | "success"
  | "error";

const inputClassName =
  "mt-2 min-h-12 w-full rounded-xl border border-[#741314]/16 bg-white px-4 text-base text-[#381932] outline-none transition placeholder:text-[#381932]/35 focus:border-[#741314]/55 focus:ring-2 focus:ring-[#741314]/10";

const captureTypeOptions = [
  { value: "place" as const, label: "Lugar", description: "Parque, fuente o monumento", icon: Compass },
  { value: "venue" as const, label: "Local", description: "Fachada y datos básicos", icon: Building2 },
  { value: "product" as const, label: "Producto", description: "Plato o producto real", icon: Utensils },
];

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

export function AdminScoutCapture({
  cities,
  categories,
  venues,
  initialType = "place",
  initialVenueId = "",
}: AdminScoutCaptureProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const requestedLocationRef = useRef(false);
  const [captureType, setCaptureType] = useState<ScoutCaptureType>(initialType);
  const [cityId, setCityId] = useState(cities[0]?.id ?? "");
  const [venueId, setVenueId] = useState(
    venues.some((venue) => venue.id === initialVenueId) ? initialVenueId : "",
  );
  const [category, setCategory] = useState("");
  const [accessType, setAccessType] = useState<"free" | "restricted" | "unknown">(
    "unknown",
  );
  const [selectedAllergens, setSelectedAllergens] = useState<MenuItemAllergen[]>([]);
  const [processedImage, setProcessedImage] = useState<File | null>(null);
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageProgress, setImageProgress] = useState(0);
  const [progressState, setProgressState] = useState<ScoutProgressState | null>(null);
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [accuracy, setAccuracy] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedCapture, setSavedCapture] = useState<{
    id: string;
    type: ScoutCaptureType;
    venueId?: string;
  } | null>(null);

  const selectedCategory = categories.find((item) => item.value === category);
  const selectedVenue = venues.find((venue) => venue.id === venueId);
  const captureLabel =
    captureType === "place" ? "lugar" : captureType === "venue" ? "local" : "producto";

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
    const savedVenue = window.sessionStorage.getItem("pickyalo.scout.last-venue");
    if (!initialVenueId && savedVenue && venues.some((venue) => venue.id === savedVenue)) {
      setVenueId(savedVenue);
    }
  }, [categories, initialVenueId, requestLocation, venues]);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  async function handleImage(file: File | undefined) {
    if (!file) return;
    setImageError(null);
    setSubmitError(null);
    setProgressState("processing");
    setImageProgress(15);
    try {
      const result = await processScoutImage(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setProcessedImage(result.cover);
      setThumbnailImage(result.thumbnail);
      setPreviewUrl(URL.createObjectURL(result.cover));
      setImageProgress(100);
      setProgressState("ready");
    } catch (error) {
      setProcessedImage(null);
      setThumbnailImage(null);
      setImageProgress(0);
      setProgressState("error");
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

    let uploadId: string | null = null;
    setSubmitting(true);
    setSubmitError(null);
    try {
      setProgressState("uploading");
      setImageProgress(15);
      const ticket = await prepareScoutUploadAction(captureType);
      if (!ticket.ok) throw new Error(ticket.error);
      uploadId = ticket.id;

      setImageProgress(35);
      await uploadScoutFile(ticket.uploads.cover.signedUrl, processedImage);
      setImageProgress(70);
      await uploadScoutFile(ticket.uploads.thumbnail.signedUrl, thumbnailImage);
      setImageProgress(88);
      setProgressState("saving");

      const formData = new FormData(event.currentTarget);
      formData.set("uploadId", ticket.id);
      formData.set("captureType", captureType);
      const result = await createScoutDraftAction(formData);
      if (!result.ok) throw new Error(result.error);

      uploadId = null;
      setImageProgress(100);
      setProgressState("success");
      setSavedCapture({ id: result.id, type: result.type, venueId: result.venueId });
    } catch (error) {
      if (uploadId) await discardScoutUploadAction(captureType, uploadId);
      setProgressState("error");
      setImageProgress(100);
      setSubmitError(
        error instanceof Error ? error.message : "No se pudo guardar la captura. Reinténtalo.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function resetCapture() {
    formRef.current?.reset();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setProcessedImage(null);
    setThumbnailImage(null);
    setImageError(null);
    setImageProgress(0);
    setProgressState(null);
    setLatitude("");
    setLongitude("");
    setAccuracy("");
    setLocationState("idle");
    setLocationError(null);
    setAccessType("unknown");
    setSelectedAllergens([]);
    setSubmitError(null);
    setSavedCapture(null);
    requestedLocationRef.current = true;
    requestLocation();
  }

  if (savedCapture) {
    const completeHref =
      savedCapture.type === "place"
        ? `/panel/lugares/${savedCapture.id}`
        : savedCapture.type === "venue"
          ? `/panel/locales/${savedCapture.id}`
          : `/panel/locales/${savedCapture.venueId}/platos/${savedCapture.id}`;
    const pendingHref =
      savedCapture.type === "place"
        ? "/panel/lugares?estado=pending"
        : savedCapture.type === "venue"
          ? "/panel/locales?estado=pending"
          : `/panel/locales/${savedCapture.venueId}/platos?estado=pending`;

    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-emerald-200 bg-white p-6 shadow-[0_22px_60px_rgba(56,25,50,0.08)] sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Check aria-hidden="true" className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-2xl font-semibold text-[#381932]">Captura guardada</h2>
        <p className="mt-2 text-sm leading-6 text-[#381932]/65">
          Se ha creado como pendiente. No será visible públicamente hasta que completes y publiques su ficha.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={resetCapture}
            className="min-h-12 rounded-full bg-[#741314] px-4 text-sm font-bold text-[#FFF7E8]"
          >
            Capturar otro
          </button>
          <Link
            href={completeHref}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#741314]/22 px-4 text-center text-sm font-bold text-[#741314]"
          >
            Completar ahora
          </Link>
          <Link
            href={pendingHref}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#741314]/22 px-4 text-center text-sm font-bold text-[#741314]"
          >
            Ver pendientes
          </Link>
          {savedCapture.type === "venue" ? (
            <Link
              href={`/panel/scout?tipo=product&venueId=${savedCapture.id}`}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#741314]/22 px-4 text-center text-sm font-bold text-[#741314]"
            >
              Capturar su producto
            </Link>
          ) : null}
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
      <input type="hidden" name="captureType" value={captureType} />

      <div className="space-y-4">
        <fieldset className="rounded-3xl border border-[#741314]/12 bg-white p-3">
          <legend className="px-2 text-xs font-bold uppercase tracking-[0.16em] text-[#741314]/60">
            Qué vas a capturar
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {captureTypeOptions.map((option) => {
              const Icon = option.icon;
              const active = captureType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setCaptureType(option.value);
                    setSubmitError(null);
                  }}
                  className={`flex min-h-[5.5rem] flex-col items-center justify-center rounded-2xl border px-2 py-3 text-center transition ${
                    active
                      ? "border-[#741314] bg-[#741314] text-[#FFF7E8]"
                      : "border-[#741314]/12 bg-[#FFF7E8] text-[#381932]"
                  }`}
                >
                  <Icon aria-hidden="true" className="h-6 w-6" />
                  <span className="mt-2 text-sm font-bold">{option.label}</span>
                  <span className={`mt-1 hidden text-[11px] leading-4 sm:block ${active ? "text-[#FFF7E8]/72" : "text-[#381932]/55"}`}>
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <section className="overflow-hidden rounded-3xl border border-[#741314]/12 bg-[#FFF7E8] shadow-[0_20px_55px_rgba(56,25,50,0.07)]">
          <div className="relative aspect-[4/3] bg-[#F7E7D1]">
            {previewUrl ? (
              // A local object URL is intentionally used before the file reaches Storage.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Vista previa de la captura" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center text-[#741314]">
                <Camera aria-hidden="true" className="h-10 w-10" />
                <p className="mt-3 text-base font-bold">Fotografía el {captureLabel}</p>
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
          {progressState ? (
            <div className="px-4 pb-4" aria-live="polite">
              <div className="h-1.5 overflow-hidden rounded-full bg-[#741314]/10">
                <div
                  className={`h-full rounded-full transition-[width] ${progressState === "error" ? "bg-red-700" : "bg-[#741314]"}`}
                  style={{ width: `${imageProgress}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-semibold text-[#381932]/60">
                {progressState === "processing"
                  ? "Procesando imagen..."
                  : progressState === "ready"
                    ? `Imagen preparada · ${Math.ceil((processedImage?.size ?? 0) / 1024)} KB`
                    : progressState === "uploading"
                      ? "Subiendo fotografía..."
                      : progressState === "saving"
                        ? "Creando captura..."
                        : progressState === "success"
                          ? "Captura guardada"
                          : "No se pudo completar. Puedes reintentar."}
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

        {captureType === "product" ? (
          <label className="block rounded-3xl border border-[#741314]/12 bg-white p-5">
            <span className="text-sm font-semibold text-[#381932]">Local del producto</span>
            <select
              name="venueId"
              value={venueId}
              onChange={(event) => {
                setVenueId(event.target.value);
                window.sessionStorage.setItem("pickyalo.scout.last-venue", event.target.value);
              }}
              className={inputClassName}
              required
            >
              <option value="">Selecciona un local</option>
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>{venue.name}</option>
              ))}
            </select>
            {selectedVenue ? (
              <p className="mt-3 text-sm leading-6 text-[#381932]/62">
                Se guardará pendiente dentro de {selectedVenue.name}.
              </p>
            ) : null}
          </label>
        ) : cities.length > 1 ? (
          <label className="block rounded-3xl border border-[#741314]/12 bg-white p-5">
            <span className="text-sm font-semibold text-[#381932]">Ciudad</span>
            <select name="cityId" value={cityId} onChange={(event) => setCityId(event.target.value)} className={inputClassName} required>
              {cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
            </select>
          </label>
        ) : (
          <input type="hidden" name="cityId" value={cityId} />
        )}

        {captureType !== "place" ? (
          <label className="block rounded-3xl border border-[#741314]/12 bg-white p-5">
            <span className="text-sm font-semibold text-[#381932]">
              {captureType === "venue" ? "Nombre del local" : "Nombre del producto o plato"}
            </span>
            <input
              name="name"
              className={inputClassName}
              maxLength={140}
              autoCapitalize="words"
              placeholder={captureType === "venue" ? "Como aparece en la fachada" : "Como aparece en la carta"}
              required
            />
          </label>
        ) : null}

        {captureType === "product" ? (
          <fieldset className="rounded-3xl border border-[#741314]/12 bg-[#FFF7E8] p-5">
            <legend className="px-1 text-sm font-semibold text-[#381932]">Puede contener trazas de</legend>
            <p className="mt-2 text-sm leading-6 text-[#381932]/58">
              Marca solo lo observado o confirmado. Podrás revisarlo antes de publicar.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {menuItemAllergenOptions.map((allergen) => {
                const checked = selectedAllergens.includes(allergen.value);
                return (
                  <label
                    key={allergen.value}
                    className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                      checked
                        ? "border-[#741314] bg-[#741314] text-[#FFF7E8]"
                        : "border-[#741314]/14 bg-white text-[#381932]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="allergens"
                      value={allergen.value}
                      checked={checked}
                      onChange={() => {
                        setSelectedAllergens((current) =>
                          current.includes(allergen.value)
                            ? current.filter((value) => value !== allergen.value)
                            : [...current, allergen.value],
                        );
                      }}
                      className="sr-only"
                    />
                    <span>{allergen.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        <details className="group rounded-3xl border border-[#741314]/12 bg-[#FFF7E8] p-5">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-bold text-[#741314] [&::-webkit-details-marker]:hidden">
            <span>+ Añadir detalles ahora</span>
            <ChevronDown aria-hidden="true" className="h-5 w-5 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-5 space-y-5 border-t border-[#741314]/10 pt-5">
            {captureType === "place" ? (
              <>
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
              </>
            ) : (
              <>
                <label className="block">
                  <span className="text-sm font-semibold text-[#381932]">Descripción breve</span>
                  <textarea
                    name="description"
                    rows={3}
                    maxLength={1200}
                    className={`${inputClassName} py-3`}
                    placeholder={captureType === "venue" ? "Qué vende o qué lo hace interesante" : "Ingredientes o detalle útil que recuerdes"}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-[#381932]">Categoría provisional</span>
                  <input
                    name={captureType === "venue" ? "venueCategory" : "productCategory"}
                    className={inputClassName}
                    maxLength={100}
                    autoCapitalize="words"
                    placeholder={captureType === "venue" ? "Bar, panadería, tienda..." : "Entrante, postre, bebida..."}
                  />
                </label>
                {captureType === "venue" ? (
                  <label className="block">
                    <span className="text-sm font-semibold text-[#381932]">Dirección visible</span>
                    <input name="address" className={inputClassName} maxLength={260} autoCapitalize="words" placeholder="Calle o referencia de la fachada" />
                  </label>
                ) : null}
              </>
            )}
            <label className="block">
              <span className="text-sm font-semibold text-[#381932]">Nota rápida</span>
              <textarea name="note" rows={3} maxLength={600} className={`${inputClassName} py-3`} placeholder="Algo que convenga revisar después" />
            </label>
            {captureType !== "product" ? (
              <label className="block">
                <span className="text-sm font-semibold text-[#381932]">Disponibilidad u horario observado</span>
                <input name="availability" className={inputClassName} maxLength={260} placeholder="Si lo conoces" />
              </label>
            ) : null}
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
              {progressState === "ready" || (progressState === "error" && processedImage)
                ? "Imagen preparada"
                : "Falta la foto"} · {locationState === "ready" ? "GPS listo" : "GPS opcional"}
            </p>
          </div>
          <button
            type="submit"
            disabled={
              submitting ||
              !processedImage ||
              (captureType !== "product" && !cityId) ||
              (captureType === "product" && !venueId)
            }
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#741314] px-6 text-sm font-bold text-[#FFF7E8] shadow-[0_12px_28px_rgba(116,19,20,0.18)] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
          >
            {submitting ? <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" /> : <RotateCcw aria-hidden="true" className="h-5 w-5" />}
            {submitting ? "Guardando..." : `Guardar ${captureLabel}`}
          </button>
        </div>
      </div>
    </form>
  );
}
