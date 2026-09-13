"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, CheckCheck, ChevronRight, CirclePause, LockKeyhole, Minus, Plus, Power, Search, Sparkles, Utensils, X } from "lucide-react";
import { getPricePresentation, PRICE_DISPLAY_MODES, type PriceDisplayMode } from "@/features/pricing/price-display";
import { updateManagedVenue } from "@/features/manage/actions";
import { parseManagePrice } from "@/features/manage/validation";
import type { ManageChange, ManagedItem, ManagedVenue } from "@/features/manage/types";
import styles from "./manage-venue-panel.module.css";

const modes: Record<PriceDisplayMode, { label: string; hint: string }> = {
  fixed: { label: "Precio fijo", hint: "El precio exacto" },
  from: { label: "Desde", hint: "Un precio de partida" },
  variable: { label: "Variable", hint: "Según peso, tamaño…" },
  hidden: { label: "Sin precio", hint: "Consultar en el local" },
};

export function ManageVenuePanel({ initialVenue, token }: { initialVenue: ManagedVenue; token: string }) {
  const router = useRouter();
  const [venue, setVenue] = useState(initialVenue);
  const [pending, setPending] = useState(false);
  const locked = useRef(false);
  const [feedback, setFeedback] = useState<{ message: string; error?: boolean }>({ message: "" });
  const [expired, setExpired] = useState(false);
  const [editing, setEditing] = useState<ManagedItem | null>(null);
  const [query, setQuery] = useState("");
  useEffect(() => { setVenue(initialVenue); }, [initialVenue]);
  useEffect(() => {
    if (!feedback.message || feedback.error || pending) return;
    const timer = window.setTimeout(() => setFeedback({ message: "" }), 2800);
    return () => window.clearTimeout(timer);
  }, [feedback, pending]);
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === "visible" && !locked.current) router.refresh(); };
    const restore = (event: PageTransitionEvent) => { if (event.persisted) window.location.reload(); };
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("pageshow", restore);
    return () => { document.removeEventListener("visibilitychange", refresh); window.removeEventListener("pageshow", restore); };
  }, [router]);

  async function save(change: ManageChange) {
    if (locked.current || expired) return false;
    locked.current = true;
    setPending(true);
    setFeedback({ message: "Guardando…" });
    try {
      const result = await updateManagedVenue(token, change);
      if (!result.ok) {
        setFeedback({ message: result.message, error: true });
        if (result.expired) { setExpired(true); setEditing(null); }
        return false;
      }
      setVenue(result.venue);
      setFeedback({ message: "Listo. Cambio guardado." });
      return true;
    } catch {
      setFeedback({ message: "No se ha podido confirmar el cambio. Revisa tu conexión y recarga.", error: true });
      return false;
    } finally { locked.current = false; setPending(false); }
  }

  const disabled = pending || expired;
  const items = venue.items.filter((item) => `${item.name} ${item.categoryName ?? ""}`.toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es")));
  const available = venue.items.filter((item) => item.isAvailable).length;
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <Image src="/icons/pickyalo-app.svg" alt="Pickyalo" width={52} height={52} priority />
          <span className={styles.privateBadge}><LockKeyhole size={12} aria-hidden="true" />Solo tu comercio</span>
        </header>

        <div className={styles.intro}>
          <div><p className={styles.eyebrow}>A pie de calle. Al día.</p><h1>{venue.name}</h1><p className={styles.city}>{venue.cityName ?? "Tu comercio en Pickyalo"}</p></div>
          {venue.isPublished && venue.citySlug ? <a className={styles.publicLink} href={`/zonas/${venue.citySlug}/venues/${venue.slug}`} target="_blank" rel="noopener noreferrer">Ver mi ficha<ArrowUpRight size={19} aria-hidden="true" /></a> : <span className={styles.unpublished}>Ficha aún sin publicar</span>}
        </div>

        <section className={styles.statusBoard} data-open={venue.isOpenNow} aria-labelledby="opening-title">
          <div className={styles.statusTop}><span className={styles.eyebrow}><span className={styles.liveDot} />Ahora mismo</span><span className={styles.serial}>LOCAL / ON·OFF</span></div>
          <div className={styles.statusHeadline}>
            <div><h2 id="opening-title">{venue.isOpenNow ? "Abierto." : "Cerrado."}</h2><p>{venue.isOpenNow ? "La puerta está abierta. Que vengan." : "Hacemos una pausa. Tú decides cuándo volver."}</p></div>
            <span className={styles.sticker} aria-hidden="true"><Image src="/manage/sticker-pack.png" alt="" width={1227} height={1254} sizes="420px" priority /></span>
          </div>
          <button type="button" role="switch" aria-checked={venue.isOpenNow} aria-label="Comercio abierto" className={styles.physicalSwitch} disabled={disabled} onClick={() => save({ kind: "opening", value: !venue.isOpenNow })}>
            <span className={styles.switchThumb} aria-hidden="true"><span /><span /><span /></span>
            <span className={styles.switchOption}><CirclePause size={22} aria-hidden="true" />Cerrado</span>
            <span className={styles.switchOption}><Power size={22} aria-hidden="true" />Abierto</span>
          </button>
          <div className={styles.statusFoot}>
            <p>{venue.manualOpenStatus === null ? "Ahora manda tu horario habitual." : "Así seguirá hasta que lo cambies."}</p>
            {venue.manualOpenStatus !== null ? <button type="button" disabled={disabled} onClick={() => save({ kind: "opening", value: null })}>Usar horario habitual<ChevronRight size={14} aria-hidden="true" /></button> : null}
          </div>
        </section>

        <section className={styles.catalogue} aria-labelledby="products-title">
          <div className={styles.catalogueHeading}><div><p className={styles.eyebrow}>Toca. Cambia. Sigue.</p><h2 id="products-title">Tu escaparate<span className={styles.count}>{venue.items.length}</span></h2></div><span className={styles.availableCount}>{available} disponibles</span></div>
          {!venue.pricesVisible ? <p className={styles.notice}>Tu ficha tiene los precios ocultos. Puedes actualizarlos aquí; seguirán ocultos al público.</p> : null}
          {venue.items.length > 8 ? <label className={styles.search}><Search size={20} aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Encuentra un producto" aria-label="Buscar producto" /></label> : null}
          <div className={styles.items}>
            {items.map((item) => <article key={item.id} className={styles.item} data-unavailable={!item.isAvailable}>
              <div className={styles.itemMain}>
                <div className={styles.itemPhoto}>{item.imageUrl ? <Image src={item.imageUrl} alt="" fill sizes="110px" /> : <Utensils size={32} aria-hidden="true" />}{item.isFeatured ? <span className={styles.photoStamp}><Sparkles size={13} aria-hidden="true" /></span> : null}</div>
                <div className={styles.itemCopy}><p className={styles.category}>{item.categoryName ?? "De la casa"}</p><h3>{item.name}</h3><button type="button" disabled={disabled} className={styles.price} onClick={() => setEditing(item)} aria-label={`Cambiar precio de ${item.name}: ${getPricePresentation(item).label}`}><span>{getPricePresentation(item).label}</span><span className={styles.priceEdit}>Editar<ChevronRight size={13} aria-hidden="true" /></span></button></div>
              </div>
              <div className={styles.itemControls}>
                <button type="button" className={styles.availability} aria-pressed={item.isAvailable} aria-label={`${item.isAvailable ? "Marcar agotado" : "Marcar disponible"}: ${item.name}`} disabled={disabled} onClick={() => save({ kind: "availability", itemId: item.id, value: !item.isAvailable })}>{item.isAvailable ? <Check size={18} aria-hidden="true" /> : <Minus size={18} aria-hidden="true" />}{item.isAvailable ? "Disponible" : "Agotado"}</button>
                <button type="button" className={styles.featured} aria-pressed={item.isFeatured} aria-label={`${item.isFeatured ? "Quitar destacado" : "Destacar"}: ${item.name}`} disabled={disabled} onClick={() => save({ kind: "featured", itemId: item.id, value: !item.isFeatured })}><Sparkles size={18} aria-hidden="true" />{item.isFeatured ? "Destacado" : "Destacar"}</button>
              </div>
            </article>)}
          </div>
          {!items.length ? <p className={styles.empty}>{venue.items.length ? "No hay productos con ese nombre." : "Tu escaparate está en camino. Los productos aparecerán aquí cuando Pickyalo los prepare."}</p> : null}
        </section>
        <footer className={styles.footer}><span>El barrio se mueve.<br /><strong>Tu comercio también.</strong></span><LockKeyhole size={18} aria-hidden="true" /><p>Este enlace es tu llave.<br />Guárdalo solo para tu equipo.</p></footer>
      </div>
      <div className={styles.saveStatus} role={feedback.error ? "alert" : "status"} data-error={feedback.error} data-visible={!!feedback.message} aria-live="polite">{feedback.error ? <CirclePause size={17} aria-hidden="true" /> : <CheckCheck size={17} aria-hidden="true" />}<span>{feedback.message}</span></div>
      {editing ? <PriceEditor item={editing} disabled={disabled} onClose={() => setEditing(null)} onSave={async (change) => { const ok = await save(change); if (ok) setEditing(null); return ok; }} /> : null}
    </main>
  );
}

function PriceEditor({ item, disabled, onSave, onClose }: { item: ManagedItem; disabled: boolean; onSave: (change: ManageChange) => Promise<boolean>; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState(item.priceDisplayMode);
  const [amount, setAmount] = useState((item.priceAmount / 100).toFixed(2).replace(".", ","));
  const [text, setText] = useState(item.priceDisplayText ?? "");
  const [error, setError] = useState("");
  const numeric = mode === "fixed" || mode === "from";
  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    element?.showModal();
    return () => { element?.close(); trigger?.focus(); };
  }, []);
  function step(delta: number) {
    const current = parseManagePrice(amount) ?? item.priceAmount;
    setAmount((Math.min(2147483647, Math.max(0, current + delta)) / 100).toFixed(2).replace(".", ","));
    setError("");
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = parseManagePrice(amount);
    if (numeric && parsed === null) { setError("Escribe un precio válido, con hasta dos decimales."); return; }
    setError("");
    const ok = await onSave({ kind: "price", itemId: item.id, mode, ...(numeric ? { amount: parsed! } : {}), text: text.trim() || null });
    if (!ok) setError("No se ha guardado el precio. Revisa el aviso y vuelve a intentarlo.");
  }
  return <dialog ref={dialog} className={styles.dialog} onCancel={(event) => { event.preventDefault(); if (!disabled) onClose(); }} aria-labelledby="price-title" onClick={(event) => { if (event.target === event.currentTarget && !disabled) onClose(); }}>
    <form onSubmit={submit} className={styles.priceForm}>
      <div className={styles.sheetHandle} aria-hidden="true" />
      <div className={styles.sheetHeading}><div><p className={styles.eyebrow}>A tu precio</p><h2 id="price-title">{item.name}</h2></div><button type="button" aria-label="Cerrar editor de precio" disabled={disabled} className={styles.close} onClick={onClose}><X size={22} /></button></div>
      <fieldset className={styles.modes} disabled={disabled}><legend className="sr-only">Cómo se muestra el precio</legend>{PRICE_DISPLAY_MODES.map((value) => <label key={value} data-selected={value === mode}><input type="radio" name="price-mode" value={value} checked={value === mode} onChange={() => { setMode(value); setError(""); }} /><span>{modes[value].label}<small>{modes[value].hint}</small></span></label>)}</fieldset>
      {numeric ? <div className={styles.amountField}><label htmlFor="manage-price-amount">{mode === "from" ? "Precio desde" : "Precio"} ({item.currency})</label><div className={styles.amountControls}><button type="button" disabled={disabled} onClick={() => step(-50)} aria-label="Restar 50 céntimos"><Minus size={24} /></button><input autoComplete="off" id="manage-price-amount" inputMode="decimal" value={amount} disabled={disabled} onChange={(event) => { setAmount(event.target.value); setError(""); }} onFocus={(event) => event.target.select()} aria-invalid={!!error} aria-describedby={error ? "price-error" : undefined} /><button type="button" disabled={disabled} onClick={() => step(50)} aria-label="Sumar 50 céntimos"><Plus size={24} /></button></div></div> : <label className={styles.labelField}>Texto del precio <span>(opcional)</span><input value={text} maxLength={80} disabled={disabled} onChange={(event) => setText(event.target.value)} placeholder={mode === "variable" ? "Ej. Según peso" : "Ej. Consultar en el local"} /><small>{mode === "variable" ? "No hace falta indicar una cantidad." : "No se mostrará ningún importe."}</small></label>}
      {error ? <p id="price-error" role="alert" className={styles.priceError}>{error}</p> : null}
      <button type="submit" disabled={disabled} className={styles.savePrice}>{disabled ? "Guardando…" : "Guardar precio"}<Check size={20} aria-hidden="true" /></button>
    </form>
  </dialog>;
}
