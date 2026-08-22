"use client";

import { ImageIcon, LoaderCircle, Upload, Video, X } from "lucide-react";
import { useState } from "react";

import { HomeCampaignCta } from "@/components/home/home-campaign-cta";
import { prepareHomeCampaignMediaUploadAction } from "@/features/admin/services/home-campaign-media-admin-service";
import type {
  HomeCampaignConfig,
  HomeCampaignIconMotion,
  HomeCampaignMediaType,
  HomeCampaignVisualStyle,
} from "@/features/design/site-design-config";
import { processScoutImage } from "@/features/scout/process-scout-image";

const fieldClassName =
  "mt-2 min-h-11 w-full rounded-[0.9rem] border border-[#741314]/16 bg-white px-3.5 py-3 text-sm text-[#24110E] outline-none transition placeholder:text-[#24110E]/35 focus:border-[#741314] focus:ring-2 focus:ring-[#741314]/12";

const styleOptions: Array<{ value: HomeCampaignVisualStyle; label: string }> = [
  { value: "editorial", label: "Editorial" },
  { value: "glass", label: "Cristal" },
  { value: "spotlight", label: "Foco" },
  { value: "outline", label: "Contorno" },
];

const mediaOptions: Array<{
  value: HomeCampaignMediaType;
  label: string;
  icon: typeof ImageIcon;
}> = [
  { value: "none", label: "Sin recurso", icon: X },
  { value: "image", label: "Imagen", icon: ImageIcon },
  { value: "video", label: "Vídeo", icon: Video },
];

async function uploadCampaignFile(signedUrl: string, file: File) {
  const body = new FormData();
  body.append("cacheControl", "31536000");
  body.append("", file, file.name);
  const response = await fetch(signedUrl, {
    method: "PUT",
    headers: { "x-upsert": "false" },
    body,
  });

  if (!response.ok) {
    throw new Error("Supabase Storage rechazó la subida.");
  }
}

const stylePresets: Record<
  HomeCampaignVisualStyle,
  Pick<HomeCampaignConfig, "backgroundColor" | "textColor" | "accentColor" | "borderColor">
> = {
  editorial: {
    backgroundColor: "#741314",
    textColor: "#FFF7E8",
    accentColor: "#FDE3AD",
    borderColor: "#741314",
  },
  glass: {
    backgroundColor: "#741314",
    textColor: "#FFF7E8",
    accentColor: "#FDE3AD",
    borderColor: "#FDE3AD",
  },
  spotlight: {
    backgroundColor: "#381932",
    textColor: "#FFF7E8",
    accentColor: "#FED47D",
    borderColor: "#C26157",
  },
  outline: {
    backgroundColor: "#FFF7E8",
    textColor: "#741314",
    accentColor: "#741314",
    borderColor: "#741314",
  },
};

function ColorField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-semibold text-[#24110E]">
      {label}
      <span className="mt-2 flex min-h-11 items-center gap-3 rounded-[0.9rem] border border-[#741314]/16 bg-white px-3">
        <input
          type="color"
          value={/^#[0-9A-F]{6}$/i.test(value) ? value : "#000000"}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="h-8 w-9 cursor-pointer border-0 bg-transparent p-0"
          aria-label={`Elegir ${label.toLowerCase()}`}
        />
        <input
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          pattern="#[0-9A-Fa-f]{6}"
          className="min-w-0 flex-1 bg-transparent font-mono text-xs uppercase text-[#24110E]/65 outline-none"
          aria-label={`${label} en hexadecimal`}
        />
      </span>
    </label>
  );
}

export function HomeCampaignEditor({
  action,
  initialCampaign,
}: {
  action: (formData: FormData) => Promise<void>;
  initialCampaign: HomeCampaignConfig;
}) {
  const [campaign, setCampaign] = useState(initialCampaign);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaFeedback, setMediaFeedback] = useState<string | null>(null);
  const update = <Key extends keyof HomeCampaignConfig>(
    key: Key,
    value: HomeCampaignConfig[Key],
  ) => setCampaign((current) => ({ ...current, [key]: value }));
  const applyStylePreset = (visualStyle: HomeCampaignVisualStyle) => {
    setCampaign((current) => ({
      ...current,
      ...stylePresets[visualStyle],
      visualStyle,
    }));
  };
  const handleMediaUpload = async (file: File | null) => {
    if (!file || campaign.backgroundMediaType === "none") return;

    setIsUploadingMedia(true);
    setMediaFeedback(null);

    try {
      let uploadFile = file;
      let extension = "webp";

      if (campaign.backgroundMediaType === "image") {
        const processed = await processScoutImage(file);
        uploadFile = processed.cover;
      } else {
        if (!file.type.match(/^video\/(mp4|webm)$/)) {
          throw new Error("Selecciona un vídeo MP4 o WebM.");
        }
        if (file.size > 50 * 1024 * 1024) {
          throw new Error("El vídeo no puede superar 50 MB.");
        }
        extension = file.type === "video/webm" ? "webm" : "mp4";
      }

      const ticket = await prepareHomeCampaignMediaUploadAction(
        campaign.backgroundMediaType,
        extension,
      );
      if (!ticket.ok) throw new Error(ticket.error);

      await uploadCampaignFile(ticket.signedUrl, uploadFile);
      update("backgroundMediaUrl", ticket.publicUrl);
      setMediaFeedback("Recurso subido. Guarda la campaña para publicarlo.");
    } catch (error) {
      setMediaFeedback(
        error instanceof Error ? error.message : "No se pudo subir el recurso.",
      );
    } finally {
      setIsUploadingMedia(false);
    }
  };

  return (
    <form
      action={action}
      className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)]"
    >
      <div className="space-y-6 rounded-[1.35rem] border border-[#741314]/12 bg-[#FFF7E8] p-5 shadow-[0_18px_55px_rgba(116,19,20,0.07)] sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {(["enabled", "sponsored", "beamEnabled", "confettiEnabled"] as const).map((key) => (
            <label
              key={key}
              className="flex min-h-12 items-center gap-3 rounded-[0.9rem] border border-[#741314]/14 bg-white px-4 text-sm font-semibold text-[#24110E]"
            >
              <input
                name={key}
                type="checkbox"
                checked={campaign[key]}
                onChange={(event) => update(key, event.target.checked)}
                className="h-5 w-5 accent-[#741314]"
              />
              {key === "enabled"
                ? "Mostrar en la Home"
                : key === "sponsored"
                  ? "Es una colaboración"
                  : key === "beamEnabled"
                    ? "Borde luminoso"
                    : "Confeti suave"}
            </label>
          ))}
        </div>

        <section className="space-y-4 border-t border-[#741314]/12 pt-5">
          <div>
            <p className="text-sm font-bold text-[#24110E]">Acabado visual</p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {styleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => applyStylePreset(option.value)}
                  aria-pressed={campaign.visualStyle === option.value}
                  className={`min-h-11 rounded-[0.85rem] border px-3 text-xs font-bold transition ${
                    campaign.visualStyle === option.value
                      ? "border-[#741314] bg-[#741314] text-[#FFF7E8]"
                      : "border-[#741314]/14 bg-white text-[#741314] hover:border-[#741314]/40"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <input type="hidden" name="visualStyle" value={campaign.visualStyle} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField label="Fondo" name="backgroundColor" value={campaign.backgroundColor} onChange={(value) => update("backgroundColor", value)} />
            <ColorField label="Texto" name="textColor" value={campaign.textColor} onChange={(value) => update("textColor", value)} />
            <ColorField label="Acento" name="accentColor" value={campaign.accentColor} onChange={(value) => update("accentColor", value)} />
            <ColorField label="Borde" name="borderColor" value={campaign.borderColor} onChange={(value) => update("borderColor", value)} />
          </div>
        </section>

        <section className="space-y-4 border-t border-[#741314]/12 pt-5">
          <div>
            <p className="text-sm font-bold text-[#24110E]">Fondo del banner</p>
            <p className="mt-1 text-xs leading-5 text-[#24110E]/55">
              Usa una imagen o un vídeo corto. El color elegido seguirá actuando como capa para mantener el texto legible.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {mediaOptions.map((option) => {
                const Icon = option.icon;
                const selected = campaign.backgroundMediaType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      update("backgroundMediaType", option.value);
                      setMediaFeedback(null);
                    }}
                    aria-pressed={selected}
                    className={`flex min-h-12 items-center justify-center gap-2 rounded-[0.85rem] border px-2 text-xs font-bold transition ${
                      selected
                        ? "border-[#741314] bg-[#741314] text-[#FFF7E8]"
                        : "border-[#741314]/14 bg-white text-[#741314] hover:border-[#741314]/40"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {option.label}
                  </button>
                );
              })}
            </div>
            <input
              type="hidden"
              name="backgroundMediaType"
              value={campaign.backgroundMediaType}
            />
          </div>

          {campaign.backgroundMediaType !== "none" ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <label className="block text-sm font-semibold text-[#24110E]">
                  {campaign.backgroundMediaType === "image"
                    ? "URL de la imagen"
                    : "URL del vídeo"}
                  <input
                    name="backgroundMediaUrl"
                    value={campaign.backgroundMediaUrl}
                    onChange={(event) =>
                      update("backgroundMediaUrl", event.target.value)
                    }
                    inputMode="url"
                    placeholder="https://..."
                    className={fieldClassName}
                  />
                </label>
                <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#741314]/20 bg-white px-5 py-3 text-sm font-bold text-[#741314] transition hover:border-[#741314]/45 hover:bg-[#FFF7E8]">
                  {isUploadingMedia ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Upload className="h-4 w-4" aria-hidden="true" />
                  )}
                  {isUploadingMedia ? "Subiendo" : "Cargar archivo"}
                  <input
                    type="file"
                    accept={
                      campaign.backgroundMediaType === "image"
                        ? "image/*,.heic,.heif"
                        : "video/mp4,video/webm"
                    }
                    disabled={isUploadingMedia}
                    onChange={(event) => {
                      void handleMediaUpload(event.target.files?.[0] ?? null);
                      event.currentTarget.value = "";
                    }}
                    className="sr-only"
                  />
                </label>
              </div>

              <label className="block rounded-[0.9rem] border border-[#741314]/14 bg-white px-4 py-3 text-sm font-semibold text-[#24110E]">
                <span className="flex items-center justify-between gap-4">
                  <span>Opacidad del fondo</span>
                  <output
                    htmlFor="background-media-opacity"
                    className="min-w-12 rounded-full bg-[#741314]/8 px-2.5 py-1 text-center font-mono text-xs font-bold text-[#741314]"
                  >
                    {campaign.backgroundMediaOpacity}%
                  </output>
                </span>
                <input
                  id="background-media-opacity"
                  name="backgroundMediaOpacity"
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={campaign.backgroundMediaOpacity}
                  onChange={(event) =>
                    update("backgroundMediaOpacity", Number(event.target.value))
                  }
                  className="mt-3 h-11 w-full cursor-pointer accent-[#741314]"
                  aria-describedby="background-media-opacity-help"
                />
                <span
                  id="background-media-opacity-help"
                  className="block text-xs font-normal leading-5 text-[#24110E]/55"
                >
                  Ajusta solo la imagen o el vídeo. El texto mantiene su contraste.
                </span>
              </label>
            </div>
          ) : (
            <>
              <input type="hidden" name="backgroundMediaUrl" value="" />
              <input
                type="hidden"
                name="backgroundMediaOpacity"
                value={campaign.backgroundMediaOpacity}
              />
            </>
          )}

          {mediaFeedback ? (
            <p className="text-xs font-semibold leading-5 text-[#741314]" role="status">
              {mediaFeedback}
            </p>
          ) : null}
        </section>

        <section className="grid gap-4 border-t border-[#741314]/12 pt-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-[#24110E] sm:col-span-2">
            SVG del icono (opcional)
            <input
              name="iconSvgUrl"
              value={campaign.iconSvgUrl}
              onChange={(event) => update("iconSvgUrl", event.target.value)}
              placeholder="/icons/evento.svg o https://..."
              className={fieldClassName}
            />
          </label>
          <label className="block text-sm font-semibold text-[#24110E]">
            Movimiento
            <select
              name="iconMotion"
              value={campaign.iconMotion}
              onChange={(event) => update("iconMotion", event.target.value as HomeCampaignIconMotion)}
              className={fieldClassName}
            >
              <option value="none">Sin movimiento</option>
              <option value="float">Flotar</option>
              <option value="pulse">Pulso</option>
              <option value="rotate">Giro lento</option>
            </select>
          </label>
          <p className="self-end text-xs leading-5 text-[#24110E]/55">
            Usa un SVG sencillo y ligero. Se carga como imagen segura, sin inyectar su código.
          </p>
        </section>

        <section className="grid gap-4 border-t border-[#741314]/12 pt-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-[#24110E]">Etiqueta<input name="eyebrow" value={campaign.eyebrow} onChange={(event) => update("eyebrow", event.target.value)} className={fieldClassName} /></label>
          <label className="block text-sm font-semibold text-[#24110E]">Texto de acción<input name="ctaLabel" value={campaign.ctaLabel} onChange={(event) => update("ctaLabel", event.target.value)} className={fieldClassName} /></label>
          <label className="block text-sm font-semibold text-[#24110E] sm:col-span-2">Título<input name="title" value={campaign.title} onChange={(event) => update("title", event.target.value)} className={fieldClassName} /></label>
          <label className="block text-sm font-semibold text-[#24110E] sm:col-span-2">Descripción breve<textarea name="description" value={campaign.description} onChange={(event) => update("description", event.target.value)} rows={3} className={`${fieldClassName} resize-y`} /></label>
          <label className="block text-sm font-semibold text-[#24110E] sm:col-span-2">Destino<input name="href" value={campaign.href} onChange={(event) => update("href", event.target.value)} className={fieldClassName} /></label>
          <label className="block text-sm font-semibold text-[#24110E]">Empieza (opcional)<input name="startsOn" type="date" value={campaign.startsOn} onChange={(event) => update("startsOn", event.target.value)} className={fieldClassName} /></label>
          <label className="block text-sm font-semibold text-[#24110E]">Termina (opcional)<input name="endsOn" type="date" value={campaign.endsOn} onChange={(event) => update("endsOn", event.target.value)} className={fieldClassName} /></label>
        </section>

        <button
          type="submit"
          disabled={isUploadingMedia}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#741314] px-6 py-3 text-sm font-semibold text-[#FFF7E8] transition hover:bg-[#5F0F10] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-55"
        >
          {isUploadingMedia ? "Terminando subida" : "Guardar campaña"}
        </button>
      </div>

      <aside className="self-start rounded-[1.35rem] border border-[#741314]/12 bg-white p-5 shadow-[0_18px_55px_rgba(116,19,20,0.07)] xl:sticky xl:top-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#741314]/55">Vista previa en directo</p>
        <p className="mb-5 mt-2 text-sm leading-6 text-[#24110E]/58">Comprueba contraste, icono y movimiento antes de guardar.</p>
        <div className="rounded-[1.2rem] bg-[linear-gradient(145deg,#FDE3AD,#FFF7E8)] p-3 sm:p-5">
          <HomeCampaignCta campaign={campaign} preview />
        </div>
      </aside>
    </form>
  );
}
