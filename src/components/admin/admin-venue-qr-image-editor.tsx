"use client";

import { ImagePlus, LoaderCircle, RotateCcw, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

import {
  discardVenueQrImageUploadAction,
  finalizeVenueQrImageUploadAction,
  prepareVenueQrImageUploadAction,
  updateVenueQrHeroImageAction,
} from "@/features/admin/services/venue-qr-admin-service";
import { processScoutImage } from "@/features/scout/process-scout-image";

type AdminVenueQrImageEditorProps = {
  venueId: string;
  initialHeroUrl: string | null;
  coverUrl: string | null;
  featuredFallbackUrl: string | null;
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

export function AdminVenueQrImageEditor({
  venueId,
  initialHeroUrl,
  coverUrl,
  featuredFallbackUrl,
}: AdminVenueQrImageEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [heroUrl, setHeroUrl] = useState(initialHeroUrl ?? "");
  const [manualUrl, setManualUrl] = useState(initialHeroUrl ?? "");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const effectiveUrl = heroUrl || coverUrl || featuredFallbackUrl;
  const sourceLabel = heroUrl
    ? "Foto ambiente QR"
    : coverUrl
      ? "Portada del local"
      : featuredFallbackUrl
        ? "Plato destacado"
        : "Sin imagen disponible";

  async function uploadFile(file: File) {
    setBusy(true);
    setProgress(0);
    setMessage(null);
    setError(null);
    let uploadedPath: string | null = null;

    try {
      const processed = await processScoutImage(file);
      const ticket = await prepareVenueQrImageUploadAction(
        venueId,
        processed.cover.type,
      );
      if (!ticket.ok) throw new Error(ticket.error);

      uploadedPath = ticket.path;
      await uploadWithProgress(ticket.signedUrl, processed.cover, setProgress);
      const result = await finalizeVenueQrImageUploadAction(
        venueId,
        ticket.path,
      );
      if (!result.ok) throw new Error(result.error);

      uploadedPath = null;
      setHeroUrl(result.imageUrl);
      setManualUrl(result.imageUrl);
      setProgress(100);
      setMessage("Foto de ambiente optimizada y publicada.");
    } catch (caught) {
      if (uploadedPath) {
        await discardVenueQrImageUploadAction(venueId, uploadedPath);
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

  async function saveManualUrl(nextUrl = manualUrl) {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const result = await updateVenueQrHeroImageAction(venueId, nextUrl);
      setHeroUrl(result.imageUrl ?? "");
      setManualUrl(result.imageUrl ?? "");
      setMessage(
        result.imageUrl
          ? "URL guardada como foto principal del QR."
          : "El QR vuelve a usar la portada automática.",
      );
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
    <section className="overflow-hidden rounded-2xl border border-[#741314]/12 bg-white">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#741314]/60">
            Imagen principal
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[#381932]">
            Foto de ambiente del QR
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#381932]/68">
            Prioridad automática: foto de ambiente, portada del local y, si no
            existe ninguna, el primer plato destacado.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#741314] px-5 text-sm font-bold text-[#FFF7E8] disabled:cursor-wait disabled:opacity-60"
            >
              {busy ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin motion-reduce:animate-none"
                />
              ) : (
                <UploadCloud aria-hidden="true" className="h-4 w-4" />
              )}
              {busy ? `Subiendo ${progress}%` : "Subir foto de ambiente"}
            </button>
            {heroUrl ? (
              <button
                type="button"
                onClick={() => {
                  setManualUrl("");
                  void saveManualUrl("");
                }}
                disabled={busy}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#741314]/18 bg-[#FFF7E8] px-5 text-sm font-bold text-[#741314] disabled:opacity-60"
              >
                <RotateCcw aria-hidden="true" className="h-4 w-4" />
                Usar portada automática
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
            <div
              className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#741314]/10"
              aria-label={`Subida ${progress}%`}
            >
              <div
                className="h-full rounded-full bg-[#741314] transition-[width] motion-reduce:transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>
          ) : null}

          <details className="mt-5 rounded-xl border border-[#741314]/10 bg-[#FFF7E8] px-4 py-3">
            <summary className="cursor-pointer text-sm font-bold text-[#741314]">
              Usar una URL en su lugar
            </summary>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <label className="min-w-0 flex-1">
                <span className="sr-only">URL de la foto de ambiente</span>
                <input
                  type="url"
                  inputMode="url"
                  value={manualUrl}
                  onChange={(event) => setManualUrl(event.target.value)}
                  placeholder="https://..."
                  className="min-h-11 w-full rounded-xl border border-[#741314]/16 bg-white px-3.5 text-sm text-[#381932] outline-none focus:border-[#741314] focus:ring-2 focus:ring-[#741314]/10"
                />
              </label>
              <button
                type="button"
                onClick={() => void saveManualUrl()}
                disabled={busy}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#741314]/18 bg-white px-5 text-sm font-bold text-[#741314] disabled:opacity-60"
              >
                Guardar URL
              </button>
            </div>
          </details>

          <div aria-live="polite">
            {message ? (
              <p className="mt-4 text-sm font-semibold text-emerald-700">
                {message}
              </p>
            ) : null}
            {error ? (
              <p role="alert" className="mt-4 text-sm font-semibold text-rose-700">
                {error}
              </p>
            ) : null}
          </div>
        </div>

        <div className="relative min-h-72 border-t border-[#741314]/10 bg-[#F4E9D3] lg:border-l lg:border-t-0">
          {effectiveUrl ? (
            // Admin preview accepts legacy external URLs outside next/image patterns.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={effectiveUrl}
              alt="Vista previa de la portada QR"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-72 flex-col items-center justify-center gap-3 px-6 text-center text-sm text-[#381932]/60">
              <ImagePlus aria-hidden="true" className="h-7 w-7 text-[#741314]" />
              Añade una portada o un plato con fotografía
            </div>
          )}
          <span className="absolute bottom-3 left-3 rounded-full bg-[#FFF7E8] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#741314] shadow-sm">
            {sourceLabel}
          </span>
        </div>
      </div>
    </section>
  );
}
