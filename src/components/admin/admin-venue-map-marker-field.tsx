"use client";

import { ImagePlus, LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";

import {
  discardVenueMapMarkerUploadAction,
  finalizeVenueMapMarkerUploadAction,
  prepareVenueMapMarkerUploadAction,
} from "@/features/admin/services/venue-map-marker-actions";

type AdminVenueMapMarkerFieldProps = {
  venueId: string;
  subscriptionActive: boolean;
  initialImageUrl: string;
  initialEnabled: boolean;
};

function uploadWithProgress(
  signedUrl: string,
  file: File,
  onProgress: (progress: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", signedUrl);
    request.setRequestHeader("Content-Type", file.type);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () =>
      request.status >= 200 && request.status < 300
        ? resolve()
        : reject(new Error("Storage rechazó la subida."));
    request.onerror = () => reject(new Error("La subida se interrumpió."));
    request.send(file);
  });
}

export function AdminVenueMapMarkerField({
  venueId,
  subscriptionActive,
  initialImageUrl,
  initialEnabled,
}: AdminVenueMapMarkerFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    if (file.type !== "image/png") {
      setError("Selecciona un PNG con fondo transparente.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("El PNG no puede superar 2 MB.");
      return;
    }

    setBusy(true);
    setProgress(0);
    let uploadedPath: string | null = null;
    try {
      const ticket = await prepareVenueMapMarkerUploadAction(venueId, file.type);
      if (!ticket.ok) throw new Error(ticket.error);
      uploadedPath = ticket.path;
      await uploadWithProgress(ticket.signedUrl, file, setProgress);
      const result = await finalizeVenueMapMarkerUploadAction(venueId, ticket.path);
      if (!result.ok) throw new Error(result.error);
      uploadedPath = null;
      setImageUrl(result.imageUrl);
      setProgress(100);
    } catch (caught) {
      if (uploadedPath) await discardVenueMapMarkerUploadAction(venueId, uploadedPath);
      setError(caught instanceof Error ? caught.message : "No se pudo subir el isotipo.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const canUseCustomMarker = subscriptionActive && Boolean(imageUrl);

  return (
    <div className="rounded-xl border border-[#741314]/12 bg-white p-4 md:col-span-2">
      <input type="hidden" name="mapMarkerLogoUrl" value={imageUrl} />
      <div className="flex flex-wrap items-center gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-[#741314]/22 bg-[#FFF7E8] p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl || "/icons/pickyalo-app.svg"}
            alt="Vista previa del marcador"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#381932]">Isotipo del marcador</p>
          <p className="mt-1 text-xs leading-5 text-[#381932]/62">
            PNG transparente, cuadrado y de hasta 2 MB. Requiere suscripción activa.
          </p>
        </div>
        <button
          type="button"
          disabled={!subscriptionActive || busy}
          onClick={() => inputRef.current?.click()}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#741314]/18 bg-[#FFF7E8] px-4 text-sm font-bold text-[#741314] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {busy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ImagePlus className="h-4 w-4" aria-hidden="true" />}
          {busy ? `Subiendo ${progress}%` : imageUrl ? "Cambiar PNG" : "Subir PNG"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
        />
      </div>
      <label className={`mt-4 flex min-h-11 items-center gap-3 ${canUseCustomMarker ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
        <input
          name="useCustomMapMarker"
          type="checkbox"
          defaultChecked={initialEnabled && canUseCustomMarker}
          disabled={!canUseCustomMarker}
          className="h-5 w-5 accent-[#741314]"
        />
        <span className="text-sm font-medium text-[#381932]">Usar este isotipo en el mapa</span>
      </label>
      {error ? <p className="mt-3 text-sm font-medium text-red-700" role="alert">{error}</p> : null}
    </div>
  );
}
