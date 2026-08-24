"use client";

import { FileAudio, ImagePlus, LoaderCircle, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";

import {
  discardExploreUploadAction,
  finalizeExploreUploadAction,
  prepareExploreUploadAction,
} from "@/features/admin/services/explore-admin-service";
import { processScoutImage } from "@/features/scout/process-scout-image";

type ExploreMediaKind = "photo" | "map" | "audio" | "logo";

type AdminExploreMediaFieldProps = {
  name: string;
  label: string;
  description: string;
  kind: ExploreMediaKind;
  scopeId: string;
  initialUrl?: string;
  required?: boolean;
};

function uploadWithProgress(
  signedUrl: string,
  file: File,
  onProgress: (value: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", signedUrl);
    request.setRequestHeader("Content-Type", file.type);
    request.setRequestHeader("x-upsert", "false");
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

async function validateSvg(file: File) {
  const source = await file.text();
  const unsafe = /<script|<foreignObject|\son\w+\s*=|(?:href|xlink:href)\s*=\s*["'](?:https?:|data:)/i;
  if (!/^\s*(?:<\?xml[^>]*>\s*)?<svg\b/i.test(source) || unsafe.test(source)) {
    throw new Error("El SVG contiene elementos no permitidos. Exporta un SVG simple o un PNG.");
  }
}

async function prepareFile(file: File, kind: ExploreMediaKind) {
  const maximum = kind === "audio" ? 30 * 1024 * 1024 : 12 * 1024 * 1024;
  if (file.size > maximum) {
    throw new Error(kind === "audio" ? "El audio supera 30 MB." : "El archivo supera 12 MB.");
  }
  if (kind === "photo") return (await processScoutImage(file)).cover;
  if (kind === "map" && file.type !== "image/svg+xml") {
    return (await processScoutImage(file)).cover;
  }
  if (kind === "map" && file.type === "image/svg+xml") await validateSvg(file);
  return file;
}

export function AdminExploreMediaField({
  name,
  label,
  description,
  kind,
  scopeId,
  initialUrl = "",
  required = false,
}: AdminExploreMediaFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [url, setUrl] = useState(initialUrl);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const accept =
    kind === "audio"
      ? "audio/mpeg,audio/mp4,audio/ogg,audio/wav,audio/webm"
      : kind === "map"
        ? "image/png,image/jpeg,image/webp,image/svg+xml"
        : "image/jpeg,image/png,image/webp,image/heic,image/heif";

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    setProgress(0);
    let nextPath: string | null = null;
    try {
      const prepared = await prepareFile(file, kind);
      const ticket = await prepareExploreUploadAction(kind, prepared.type, scopeId);
      if (!ticket.ok) throw new Error(ticket.error);
      nextPath = ticket.path;
      await uploadWithProgress(ticket.signedUrl, prepared, setProgress);
      const validation = await finalizeExploreUploadAction(kind, ticket.path);
      if (!validation.ok) throw new Error(validation.error);
      if (uploadedPath) await discardExploreUploadAction(uploadedPath);
      setUploadedPath(ticket.path);
      setUrl(ticket.publicUrl);
      setProgress(100);
    } catch (caught) {
      if (nextPath) await discardExploreUploadAction(nextPath);
      setError(caught instanceof Error ? caught.message : "No se pudo subir el archivo.");
      setProgress(0);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-2xl border border-[#741314]/12 bg-white/60 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <label htmlFor={`${name}-url`} className="text-sm font-semibold text-[#381932]">
            {label}
          </label>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-[#381932]/60">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#741314] px-4 text-sm font-bold text-[#FFF7E8] disabled:opacity-55"
        >
          {busy ? (
            <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin motion-reduce:animate-none" />
          ) : kind === "audio" ? (
            <FileAudio aria-hidden="true" className="h-4 w-4" />
          ) : (
            <UploadCloud aria-hidden="true" className="h-4 w-4" />
          )}
          {busy ? `Subiendo ${progress}%` : "Subir archivo"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      {busy ? (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#741314]/10" aria-label={`Subida ${progress}%`}>
          <div className="h-full rounded-full bg-[#741314] transition-[width] motion-reduce:transition-none" style={{ width: `${progress}%` }} />
        </div>
      ) : null}

      <div className="mt-4 flex gap-3">
        {kind !== "audio" && url ? (
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#741314]/12 bg-[#FFF7E8]">
            {/* Admin previews may use user-provided legacy URLs outside next/image patterns. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
          </div>
        ) : (
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#741314]/[0.06] text-[#741314]">
            {kind === "audio" ? <FileAudio aria-hidden="true" className="h-5 w-5" /> : <ImagePlus aria-hidden="true" className="h-5 w-5" />}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <input
            id={`${name}-url`}
            name={name}
            type="url"
            inputMode="url"
            required={required}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://..."
            className="min-h-11 w-full rounded-xl border border-[#741314]/16 bg-white px-3.5 text-sm text-[#381932] outline-none focus:border-[#741314] focus:ring-2 focus:ring-[#741314]/10"
          />
          {kind === "audio" && url ? (
            <audio className="mt-3 h-10 w-full" controls preload="metadata" src={url}>
              Tu navegador no puede reproducir este audio.
            </audio>
          ) : null}
        </div>
        {url ? (
          <button
            type="button"
            title="Quitar archivo"
            aria-label={`Quitar ${label.toLowerCase()}`}
            onClick={() => {
              setUrl("");
              if (uploadedPath) {
                void discardExploreUploadAction(uploadedPath);
                setUploadedPath(null);
              }
            }}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#741314]/14 bg-white text-[#741314]"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      {error ? <p role="alert" className="mt-3 text-sm font-semibold text-rose-700">{error}</p> : null}
    </div>
  );
}
