"use client";

import { ImagePlus, LoaderCircle, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

import {
  discardVenueQrPromotionImageUploadAction,
  finalizeVenueQrPromotionImageUploadAction,
  prepareVenueQrPromotionImageUploadAction,
  updateVenueQrPromotionImageAction,
} from "@/features/admin/services/venue-qr-admin-service";
import { processScoutImage } from "@/features/scout/process-scout-image";

type AdminVenueQrPromotionImageProps = {
  venueId: string;
  initialUrl: string | null;
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
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else reject(new Error("Storage rechazó la subida."));
    };
    request.onerror = () => reject(new Error("La subida se interrumpió."));
    request.send(file);
  });
}

export function AdminVenueQrPromotionImage({
  venueId,
  initialUrl,
}: AdminVenueQrPromotionImageProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageUrl, setImageUrl] = useState(initialUrl ?? "");
  const [manualUrl, setManualUrl] = useState(initialUrl ?? "");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File) {
    setBusy(true);
    setProgress(0);
    setMessage(null);
    setError(null);
    let uploadedPath: string | null = null;

    try {
      const processed = await processScoutImage(file);
      const ticket = await prepareVenueQrPromotionImageUploadAction(
        venueId,
        processed.cover.type,
      );
      if (!ticket.ok) throw new Error(ticket.error);

      uploadedPath = ticket.path;
      await uploadWithProgress(ticket.signedUrl, processed.cover, setProgress);
      const result = await finalizeVenueQrPromotionImageUploadAction(
        venueId,
        ticket.path,
      );
      if (!result.ok) throw new Error(result.error);

      uploadedPath = null;
      setImageUrl(result.imageUrl);
      setManualUrl(result.imageUrl);
      setProgress(100);
      setMessage("Imagen promocional optimizada y guardada.");
    } catch (caught) {
      if (uploadedPath) {
        await discardVenueQrPromotionImageUploadAction(venueId, uploadedPath);
      }
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudo subir la imagen.",
      );
      setProgress(0);
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function saveUrl(nextUrl = manualUrl) {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const result = await updateVenueQrPromotionImageAction(venueId, nextUrl);
      setImageUrl(result.imageUrl ?? "");
      setManualUrl(result.imageUrl ?? "");
      setMessage(result.imageUrl ? "Imagen promocional guardada." : "Imagen eliminada.");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudo guardar la imagen.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#741314]/12 bg-white p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]">
        <div>
          <p className="text-sm font-semibold text-[#381932]">Imagen del banner</p>
          <p className="mt-1 text-xs leading-5 text-[#381932]/60">
            Utiliza únicamente material autorizado por la marca colaboradora.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#741314] px-4 text-sm font-bold text-[#FFF7E8] disabled:opacity-60"
            >
              {busy ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin motion-reduce:animate-none"
                />
              ) : (
                <UploadCloud aria-hidden="true" className="h-4 w-4" />
              )}
              {busy ? `Subiendo ${progress}%` : "Subir imagen"}
            </button>
            {imageUrl ? (
              <button
                type="button"
                onClick={() => void saveUrl("")}
                disabled={busy}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#741314]/18 bg-[#FFF7E8] px-4 text-sm font-bold text-[#741314] disabled:opacity-60"
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
                Quitar
              </button>
            ) : null}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadFile(file);
              }}
            />
          </div>

          {busy && progress > 0 ? (
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#741314]/10">
              <div
                className="h-full rounded-full bg-[#741314] transition-[width] motion-reduce:transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>
          ) : null}

          <details className="mt-4 rounded-xl border border-[#741314]/10 bg-[#FFF7E8] px-4 py-3">
            <summary className="cursor-pointer text-sm font-bold text-[#741314]">
              Usar una URL
            </summary>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                type="url"
                inputMode="url"
                value={manualUrl}
                onChange={(event) => setManualUrl(event.target.value)}
                placeholder="https://..."
                aria-label="URL de la imagen promocional"
                className="min-h-11 min-w-0 flex-1 rounded-xl border border-[#741314]/16 bg-white px-3.5 text-sm text-[#381932] outline-none focus:border-[#741314] focus:ring-2 focus:ring-[#741314]/10"
              />
              <button
                type="button"
                onClick={() => void saveUrl()}
                disabled={busy}
                className="min-h-11 rounded-xl border border-[#741314]/18 bg-white px-4 text-sm font-bold text-[#741314] disabled:opacity-60"
              >
                Guardar URL
              </button>
            </div>
          </details>
        </div>

        <div className="relative min-h-36 overflow-hidden rounded-xl bg-[#F4E9D3]">
          {imageUrl ? (
            // Admin preview accepts legacy external URLs.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="Vista previa de la promoción"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-36 items-center justify-center text-[#741314]/55">
              <ImagePlus aria-hidden="true" className="h-7 w-7" />
            </div>
          )}
        </div>
      </div>

      <div aria-live="polite">
        {message ? (
          <p className="mt-3 text-sm font-semibold text-emerald-700">{message}</p>
        ) : null}
        {error ? (
          <p role="alert" className="mt-3 text-sm font-semibold text-rose-700">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
