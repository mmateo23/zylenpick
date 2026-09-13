"use client";

import { ImagePlus, LoaderCircle, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

import {
  discardVenueQrImageUploadAction,
  finalizeVenueQrStoryImageUploadAction,
  prepareVenueQrStoryImageUploadAction,
  removeVenueQrStoryImageAction,
} from "@/features/admin/services/venue-qr-admin-service";
import { processScoutImage } from "@/features/scout/process-scout-image";

type AdminVenueQrStoryImagesProps = {
  venueId: string;
  initialUrls: string[];
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

export function AdminVenueQrStoryImages({
  venueId,
  initialUrls,
}: AdminVenueQrStoryImagesProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [urls, setUrls] = useState(initialUrls.slice(0, 3));
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
      const ticket = await prepareVenueQrStoryImageUploadAction(
        venueId,
        processed.cover.type,
      );
      if (!ticket.ok) throw new Error(ticket.error);

      uploadedPath = ticket.path;
      await uploadWithProgress(ticket.signedUrl, processed.cover, setProgress);
      const result = await finalizeVenueQrStoryImageUploadAction(
        venueId,
        ticket.path,
      );
      if (!result.ok) throw new Error(result.error);

      uploadedPath = null;
      setUrls((current) => [...current, result.imageUrl].slice(0, 3));
      setProgress(100);
      setMessage("Imagen añadida a la historia.");
    } catch (caught) {
      if (uploadedPath) {
        await discardVenueQrImageUploadAction(venueId, uploadedPath);
      }
      setProgress(0);
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudo subir la imagen.",
      );
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function removeImage(imageUrl: string) {
    if (!window.confirm("¿Quitar esta imagen de la historia?")) return;
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      await removeVenueQrStoryImageAction(venueId, imageUrl);
      setUrls((current) => current.filter((url) => url !== imageUrl));
      setMessage("Imagen retirada de la historia.");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudo quitar la imagen.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#741314]/12 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#381932]">
            Imágenes de la historia
          </p>
          <p className="mt-1 text-xs leading-5 text-[#381932]/60">
            Hasta tres fotografías. Si no añades ninguna, se usará la portada
            del local.
          </p>
        </div>
        {urls.length < 3 ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#741314] px-4 text-sm font-bold text-[#FFF7E8] disabled:cursor-wait disabled:opacity-60"
          >
            {busy ? (
              <LoaderCircle
                aria-hidden="true"
                className="h-4 w-4 animate-spin motion-reduce:animate-none"
              />
            ) : (
              <UploadCloud aria-hidden="true" className="h-4 w-4" />
            )}
            {busy ? `Subiendo ${progress}%` : "Añadir imagen"}
          </button>
        ) : null}
        <input
          ref={inputRef}
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

      <div className="mt-4 grid grid-cols-3 gap-3">
        {urls.map((imageUrl, index) => (
          <div
            key={imageUrl}
            className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#F4E9D3]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={`Imagen ${index + 1} de la historia`}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => void removeImage(imageUrl)}
              disabled={busy}
              aria-label={`Quitar imagen ${index + 1}`}
              className="absolute right-2 top-2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF7E8] text-[#741314] shadow-sm disabled:opacity-60"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        ))}
        {Array.from({ length: 3 - urls.length }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="grid aspect-[4/3] place-items-center rounded-xl border border-dashed border-[#741314]/18 bg-[#FFF7E8] text-[#741314]/35"
          >
            <ImagePlus aria-hidden="true" className="h-5 w-5" />
          </div>
        ))}
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
