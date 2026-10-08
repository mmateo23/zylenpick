"use client";

import { useState } from "react";
import Image from "next/image";
import { SHOT_IDS, type DiscoveryConfig, type ShotConfig } from "@/features/discovery/discovery-config";
import type { DiscoverySource, DiscoveryVenue } from "@/features/discovery/discovery-content";
import type { HomeShowcaseItem } from "@/features/venues/types";
import { updateDiscoveryAction } from "@/features/admin/services/discovery-admin-service";
import { prepareHomeCampaignMediaUploadAction } from "@/features/admin/services/home-campaign-media-admin-service";

const field = "mt-2 block min-h-11 w-full rounded-xl border border-[#741314]/20 bg-white p-3 text-sm text-[#24110e]";
const defaultShot: ShotConfig = { enabled: true, source: "", mediaType: "image", mediaUrl: "", sponsored: false, startsOn: "", endsOn: "" };
export function DiscoveryEditor({ initial, sources, venues, items }: { initial: DiscoveryConfig; sources: DiscoverySource[]; venues: DiscoveryVenue[]; items: HomeShowcaseItem[] }) {
  const [config, setConfig] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const updateShot = (id: typeof SHOT_IDS[number], patch: Partial<ShotConfig>) => setConfig(current => ({ ...current, shots: { ...current.shots, [id]: { ...defaultShot, ...current.shots[id], ...patch } } }));
  async function upload(id: typeof SHOT_IDS[number], file?: File) {
    if (!file) return;
    setBusy(true); setMessage("");
    try {
      const video = file.type.startsWith("video/");
      if (file.size > (video ? 50 : 15) * 1024 * 1024) throw new Error(video ? "El vídeo puede ocupar hasta 50 MB." : "La imagen puede ocupar hasta 15 MB.");
      let media = file;
      if (!video) { const { processScoutImage } = await import("@/features/scout/process-scout-image"); media = (await processScoutImage(file)).cover; }
      const ticket = await prepareHomeCampaignMediaUploadAction(video ? "video" : "image", video ? file.name.split(".").pop() ?? "" : "webp");
      if (!ticket.ok) throw new Error(ticket.error);
      const body = new FormData(); body.append("cacheControl", "31536000"); body.append("", media, media.name);
      const response = await fetch(ticket.signedUrl, { method: "PUT", headers: { "x-upsert": "false" }, body });
      if (!response.ok) throw new Error("No se ha podido subir el archivo.");
      updateShot(id, { mediaType: video ? "video" : "image", mediaUrl: ticket.publicUrl });
      setMessage("Recurso preparado. Guarda los cambios para publicarlo.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "No se ha podido subir."); }
    finally { setBusy(false); }
  }
  return <form action={async () => { setBusy(true); setMessage(""); try { const data = new FormData(); data.set("discovery", JSON.stringify(config)); await updateDiscoveryAction(data); setMessage("Escaparate guardado."); } catch (error) { setMessage(error instanceof Error ? error.message : "No se ha podido guardar."); } finally { setBusy(false); } }} className="space-y-6 text-[#741314]">
    <section className="space-y-3"><h2 className="text-2xl font-bold">Shots para descubrir.</h2><p>Conecta contenido publicado. Sin selección, mostramos lugares de Explora. Al terminar una campaña vuelve la selección propia.</p>
      {SHOT_IDS.map((id, index) => { const shot = config.shots[id] ?? defaultShot; const source = sources.find(source => source.id === shot.source); const image = shot.mediaType === "image" && shot.mediaUrl ? shot.mediaUrl : source?.imageUrl;
        return <details key={id} className="rounded-2xl border border-[#741314]/15 bg-[#fff7e8] p-5"><summary className="cursor-pointer py-2 font-bold">Shot {index + 1} · {shot.enabled ? source?.title ?? "Selección de Explora" : "Pausado"}</summary>
          <div className="mt-4 grid gap-5 md:grid-cols-[1fr_220px]"><fieldset disabled={busy} className="space-y-4">
            <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={shot.enabled} onChange={e => updateShot(id, {enabled:e.target.checked})} />Mostrar este espacio</label>
            <label className="block">Contenido<select className={field} value={shot.source} onChange={e => updateShot(id, {source:e.target.value, mediaUrl:""})}><option value="">Selección automática de Explora</option>{sources.map(source => <option key={source.id} value={source.id}>{source.label} · {source.title}</option>)}</select></label>
            <label className="block">Imagen o vídeo<input type="file" accept="image/*,.heic,.heif,video/mp4,video/webm" className={field} disabled={!shot.source || busy} onChange={e => void upload(id, e.target.files?.[0])} /></label>
            <p className="text-xs">Elige primero el contenido. Fotos hasta 15 MB; vídeos MP4 o WebM hasta 50 MB.</p>
            {shot.mediaUrl ? <button type="button" className="min-h-11 underline" onClick={() => updateShot(id, {mediaUrl:"",mediaType:"image"})}>Usar la imagen original</button> : null}
            <label className="flex min-h-11 items-center gap-2"><input type="checkbox" disabled={!shot.source} checked={shot.sponsored} onChange={e => updateShot(id, {sponsored:e.target.checked})} />Patrocinado</label>
            <div className="grid grid-cols-2 gap-3"><label>Desde<input type="date" className={field} value={shot.startsOn} onChange={e => updateShot(id, {startsOn:e.target.value})} /></label><label>Hasta<input type="date" min={shot.startsOn || undefined} className={field} value={shot.endsOn} onChange={e => updateShot(id, {endsOn:e.target.value})} /></label></div>
          </fieldset><div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#741314] text-[#fff7e8]">
            {shot.mediaType === "video" && shot.mediaUrl ? <video src={shot.mediaUrl} controls muted playsInline preload="metadata" className="h-full w-full object-cover" /> : image ? /* Uploaded images can use the existing storage host without changing the global image config. */ <Image src={image} alt={source?.title ?? "Vista previa"} fill sizes="220px" unoptimized className="object-cover" /> : <p className="p-5">La selección automática aprovecha las imágenes de Explora.</p>}
            {shot.sponsored ? <span className="absolute left-3 top-3 rounded-full bg-[#fff7e8] px-3 py-2 text-xs font-bold text-[#741314]">Patrocinado</span> : null}
          </div></div>
        </details>;
      })}
    </section>
    <section className="space-y-3"><h2 className="text-2xl font-bold">Cada local, a su manera.</h2><p>Elige qué imagen lo presenta y cómo mostrar su selección.</p>
      {venues.map(venue => { const presentation = config.venues[venue.id] ?? {image:"cover" as const,productId:"",menu:"photos" as const}; const products = items.filter(item => item.venue.id === venue.id); const update = (patch: Partial<typeof presentation>) => setConfig(current => ({ ...current, venues: { ...current.venues, [venue.id]: { ...presentation, ...patch } } }));
        return <details key={venue.id} className="rounded-2xl border border-[#741314]/15 bg-[#fff7e8] p-5"><summary className="cursor-pointer py-2 font-bold">{venue.name}</summary><fieldset disabled={busy} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label>Imagen de entrada<select className={field} value={presentation.image === "product" ? presentation.productId || products[0]?.id || "cover" : "cover"} onChange={e => update({image:e.target.value === "cover" ? "cover" : "product", productId:e.target.value === "cover" ? "" : e.target.value})}><option value="cover">Portada del local</option>{products.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
          <label>Presentación de productos<select className={field} value={presentation.menu} onChange={e => update({menu:e.target.value === "written" ? "written" : "photos"})}><option value="photos">Fotos y lista para los que no tienen foto</option><option value="written">Carta escrita</option></select></label>
          <a href={`/panel/locales/${venue.id}`} className="py-2 text-sm underline">Editar ficha y foto de portada</a><a href={`/panel/locales/${venue.id}/platos`} className="py-2 text-sm underline">Editar productos y precios</a>
        </fieldset></details>;
      })}
    </section>
    <div className="sticky bottom-3 rounded-2xl border border-[#741314]/20 bg-[#fff7e8] p-4 shadow-lg"><button disabled={busy} className="min-h-12 rounded-full bg-[#741314] px-6 font-bold text-[#fff7e8] disabled:opacity-50">{busy ? "Preparando…" : "Guardar cambios"}</button>{message ? <p role="status" className="mt-3 text-sm">{message}</p> : null}</div>
  </form>;
}
