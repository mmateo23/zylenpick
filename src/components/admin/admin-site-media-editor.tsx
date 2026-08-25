"use client";

import { ExternalLink, ImagePlus, LoaderCircle, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

import {
  discardSiteMediaUploadAction,
  finalizeSiteMediaUploadAction,
  prepareSiteMediaUploadAction,
  type AdminSiteMediaAssetItem,
  updateSiteMediaAssetAction,
} from "@/features/admin/services/media-admin-service";
import { processScoutImage } from "@/features/scout/process-scout-image";

type AdminSiteMediaEditorProps = {
  asset: AdminSiteMediaAssetItem;
  route: string;
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
      if (request.status >= 200 && request.status < 300) {
        resolve();
      } else {
        reject(new Error("Storage rechazó la subida."));
      }
    };
    request.onerror = () => reject(new Error("La subida se interrumpió."));
    request.send(file);
  });
}

export function AdminSiteMediaEditor({ asset, route }: AdminSiteMediaEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageUrl, setImageUrl] = useState(asset.imageUrl);
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
      const preparedFile = processed.cover;
      const ticket = await prepareSiteMediaUploadAction(
        asset.key,
        preparedFile.type,
      );

      if (!ticket.ok) {
        throw new Error(ticket.error);
      }

      uploadedPath = ticket.path;
      await uploadWithProgress(ticket.signedUrl, preparedFile, setProgress);
      const result = await finalizeSiteMediaUploadAction(asset.key, ticket.path);

      if (!result.ok) {
        throw new Error(result.error);
      }

      uploadedPath = null;
      setImageUrl(result.imageUrl);
      setProgress(100);
      setMessage("Imagen optimizada y publicada.");
    } catch (caught) {
      if (uploadedPath) {
        await discardSiteMediaUploadAction(uploadedPath);
      }
      setError(
        caught instanceof Error ? caught.message : "No se pudo subir la imagen.",
      );
      setProgress(0);
    } finally {
      setBusy(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-[#741314]/14 bg-white shadow-[0_16px_40px_rgba(56,25,50,0.08)]">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#741314] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#FFF7E8]">
                  {asset.slot}
                </span>
                <span className="rounded-full border border-[#741314]/14 bg-[#FFF7E8] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#741314]">
                  Imagen
                </span>
              </div>
              <h3 className="mt-4 text-xl font-black tracking-[-0.025em] text-[#381932]">
                {asset.label}
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#381932]/68">
                {asset.description}
              </p>
            </div>

            <Link
              href={route}
              target="_blank"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#741314]/18 bg-[#FFF7E8] px-4 text-sm font-bold text-[#741314] transition hover:border-[#741314] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314]"
            >
              Ver en la web
              <ExternalLink aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 rounded-xl border border-[#741314]/10 bg-[#FFF7E8] px-4 py-3 text-xs leading-5 text-[#381932]/70">
            <strong className="text-[#381932]">Formato recomendado:</strong>{" "}
            {asset.recommendedSize}. JPG, PNG, WebP o HEIC; la subida se convierte a WebP.
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#741314] px-5 text-sm font-black text-[#FFF7E8] transition hover:bg-[#5F0F10] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2"
            >
              {busy ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin motion-reduce:animate-none"
                />
              ) : (
                <UploadCloud aria-hidden="true" className="h-4 w-4" />
              )}
              {busy ? `Subiendo ${progress}%` : "Subir nueva imagen"}
            </button>
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

          {busy ? (
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

          <details className="mt-5 rounded-xl border border-[#741314]/10 bg-white px-4 py-3">
            <summary className="cursor-pointer text-sm font-bold text-[#741314]">
              Usar una URL en su lugar
            </summary>
            <form
              action={updateSiteMediaAssetAction.bind(null, asset.key)}
              className="mt-4 flex flex-col gap-3 sm:flex-row"
            >
              <label className="min-w-0 flex-1">
                <span className="sr-only">URL de {asset.label}</span>
                <input
                  name="imageUrl"
                  type="text"
                  inputMode="url"
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  placeholder="https://..."
                  className="min-h-11 w-full rounded-xl border border-[#741314]/16 bg-white px-3.5 text-sm text-[#381932] outline-none focus:border-[#741314] focus:ring-2 focus:ring-[#741314]/10"
                />
              </label>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#741314]/18 bg-[#FFF7E8] px-5 text-sm font-black text-[#741314] hover:border-[#741314]"
              >
                Guardar URL
              </button>
            </form>
          </details>

          <div aria-live="polite">
            {message ? (
              <p className="mt-4 text-sm font-semibold text-emerald-700">{message}</p>
            ) : null}
            {error ? (
              <p role="alert" className="mt-4 text-sm font-semibold text-rose-700">
                {error}
              </p>
            ) : null}
          </div>
        </div>

        <div className="relative min-h-64 border-t border-[#741314]/10 bg-[#FFF7E8] lg:border-l lg:border-t-0">
          {imageUrl ? (
            // Admin previews may use legacy domains outside next/image patterns.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={`Vista previa de ${asset.label}`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-64 flex-col items-center justify-center gap-3 px-6 text-center text-sm text-[#381932]/60">
              <ImagePlus aria-hidden="true" className="h-7 w-7 text-[#741314]" />
              Sin imagen configurada
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
