"use client";

import { useState } from "react";
import { HomeEditorialPost } from "@/components/home/home-editorial-post";
import { prepareHomeCampaignMediaUploadAction } from "@/features/admin/services/home-campaign-media-admin-service";
import { getHomeCampaignImage, isHomeCampaignActive, type HomeCampaignConfig } from "@/features/design/site-design-config";

const field = "mt-2 min-h-11 w-full rounded-xl border border-[#741314]/20 bg-white px-4 py-3 text-base text-[#24110E] focus:outline-2 focus:outline-[#741314]";
const preserved = ["visualStyle", "backgroundColor", "textColor", "accentColor", "borderColor", "backgroundMediaType", "backgroundMediaUrl", "backgroundMediaOpacity", "beamEnabled", "confettiEnabled", "iconSvgUrl", "iconMotion"] as const;

export function HomeCampaignEditor({ action, initialCampaign }: {
  action: (formData: FormData) => Promise<void>; initialCampaign: HomeCampaignConfig;
}) {
  const [campaign, setCampaign] = useState(initialCampaign);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const update = <K extends keyof HomeCampaignConfig>(key: K, value: HomeCampaignConfig[K]) => setCampaign(current => ({ ...current, [key]: value }));
  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy(true); setFeedback("");
    try {
      // Reuse Scout processing, but load it only after choosing an image.
      const { processScoutImage } = await import("@/features/scout/process-scout-image");
      const processed = await processScoutImage(file);
      const ticket = await prepareHomeCampaignMediaUploadAction("image", "webp");
      if (!ticket.ok) throw new Error(ticket.error);
      const body = new FormData();
      body.append("cacheControl", "31536000"); body.append("", processed.cover, processed.cover.name);
      const response = await fetch(ticket.signedUrl, { method: "PUT", headers: { "x-upsert": "false" }, body });
      if (!response.ok) throw new Error("No se ha podido subir la imagen.");
      setCampaign(current => ({ ...current, featureImageUrl: ticket.publicUrl, featureImageEnabled: true }));
      setFeedback("Imagen preparada. Guarda el evento para publicarla.");
    } catch (error) { setFeedback(error instanceof Error ? error.message : "No se ha podido subir la imagen."); }
    finally { setBusy(false); }
  }
  return <form action={async (data) => {
    setBusy(true); setFeedback("");
    try { await action(data); setFeedback("Evento guardado."); }
    catch (error) { setFeedback(error instanceof Error ? error.message : "No se ha podido guardar."); }
    finally { setBusy(false); }
  }} className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
    <div className="space-y-5 rounded-2xl border border-[#741314]/15 bg-[#FFF7E8] p-5">
      {preserved.map(key => <input key={key} type="hidden" name={key} value={typeof campaign[key] === "boolean" ? (campaign[key] ? "on" : "") : String(campaign[key])} />)}
      <input type="hidden" name="featureImageEnabled" value={campaign.featureImageEnabled ? "on" : ""} />
      <label className="flex min-h-11 items-center gap-3 font-bold text-[#741314]"><input type="checkbox" name="enabled" checked={campaign.enabled} onChange={e => update("enabled", e.target.checked)} />Mostrar evento en la portada</label>
      <label className="block text-sm font-semibold">Título<input name="title" required={campaign.enabled} value={campaign.title} onChange={e => update("title", e.target.value)} className={field} /></label>
      <label className="block text-sm font-semibold">Descripción breve<textarea name="description" rows={3} value={campaign.description} onChange={e => update("description", e.target.value)} className={field} /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">Empieza<input name="startsOn" type="date" value={campaign.startsOn} onChange={e => update("startsOn", e.target.value)} className={field} /></label>
        <label className="block text-sm font-semibold">Termina<input name="endsOn" type="date" min={campaign.startsOn || undefined} value={campaign.endsOn} onChange={e => update("endsOn", e.target.value)} className={field} /></label>
      </div>
      <label className="block text-sm font-semibold">Imagen<input name="featureImageUrl" value={campaign.featureImageUrl} onChange={e => setCampaign(current => ({ ...current, featureImageUrl: e.target.value, featureImageEnabled: Boolean(e.target.value) }))} className={field} placeholder="URL o recurso existente" /></label>
      <label className="block text-sm font-semibold">O sube una foto<input type="file" accept="image/*,.heic,.heif" disabled={busy} onChange={e => void upload(e.target.files?.[0])} className={field} /></label>
      <label className="block text-sm font-semibold">Enlace del evento<input name="href" value={campaign.href} onChange={e => update("href", e.target.value)} className={field} /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">Texto del botón<input name="ctaLabel" required={campaign.enabled} value={campaign.ctaLabel} onChange={e => update("ctaLabel", e.target.value)} className={field} /></label>
        <label className="block text-sm font-semibold">Etiqueta<input name="eyebrow" value={campaign.eyebrow} onChange={e => update("eyebrow", e.target.value)} className={field} /></label>
      </div>
      <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="sponsored" checked={campaign.sponsored} onChange={e => update("sponsored", e.target.checked)} />Es una colaboración patrocinada</label>
      <button disabled={busy} className="min-h-12 rounded-full bg-[#741314] px-6 font-bold text-[#FFF7E8] disabled:opacity-50">{busy ? "Preparando…" : "Guardar evento"}</button>
      {feedback ? <p role="status" className="text-sm text-[#741314]">{feedback}</p> : null}
    </div>
    <aside className="space-y-5 p-3">
      <p className="text-sm font-semibold text-[#741314]">{isHomeCampaignActive(campaign) ? "Eventos en la cabecera" : "Vista previa · fuera de portada"}</p>
      <HomeEditorialPost title={campaign.title || "Tu evento"} identity={campaign.sponsored ? "Colaboración local" : "La agenda de Pickyalo"}
        location={campaign.eyebrow || "Talavera de la Reina"} eyebrow={campaign.startsOn && campaign.endsOn ? `${campaign.startsOn} — ${campaign.endsOn}` : "En la ciudad"} detail={campaign.description}
        image={getHomeCampaignImage(campaign, "/home/zonas/badges/talavera_tile_mural.png")} unoptimized />
      <p className="text-sm leading-6 text-[#694b3d]">Aparece como una tercera opción al deslizar la cabecera, junto a Lo local y Explora. Al terminar sus fechas, se retira de la portada.</p>
    </aside>
  </form>;
}
