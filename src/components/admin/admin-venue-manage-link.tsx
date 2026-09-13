"use client";

import { useState } from "react";
import { Copy, Eye, RotateCw, KeyRound } from "lucide-react";
import { getVenueManageLinkAction } from "@/features/admin/services/venue-manage-link-service";

export function AdminVenueManageLink({ venueId }: { venueId: string }) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmRotation, setConfirmRotation] = useState(false);

  async function loadLink(regenerate = false, copy = false) {
    setBusy(true);
    setMessage("");
    try {
      const result = await getVenueManageLinkAction(venueId, regenerate);
      if (!result.ok) { setMessage(result.message); return; }
      setUrl(result.url);
      setConfirmRotation(false);
      if (copy) {
        try { await navigator.clipboard.writeText(result.url); setMessage("Enlace copiado."); }
        catch { setMessage("Selecciona y copia el enlace que aparece debajo."); }
      } else if (regenerate) setMessage("Nuevo enlace listo. El anterior ha dejado de funcionar.");
    } catch { setMessage("No se ha podido obtener el enlace."); }
    finally { setBusy(false); }
  }

  const buttonClass = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#741314]/25 px-4 py-3 text-sm font-bold disabled:opacity-50";
  return (
    <section className="rounded-[1.5rem] border-2 border-[#741314] bg-[#FDE3AD] p-5 text-[#741314] sm:p-6">
      <div className="flex items-center gap-3"><KeyRound aria-hidden="true" /><h2 className="text-xl font-bold">La llave del comercio</h2></div>
      <p className="mt-2 text-sm">Un enlace privado para cambiar estado, precios y productos sin iniciar sesión. Compártelo solo con el comercio.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className={`${buttonClass} bg-[#741314] text-[#FFF7E8]`} disabled={busy} onClick={() => loadLink()}><Eye size={18} aria-hidden="true" />Ver enlace</button>
        <button type="button" className={buttonClass} disabled={busy} onClick={() => loadLink(false, true)}><Copy size={18} aria-hidden="true" />Copiar enlace</button>
        <button type="button" className={buttonClass} disabled={busy} onClick={() => setConfirmRotation(true)}><RotateCw size={18} aria-hidden="true" />Regenerar enlace</button>
      </div>
      {url ? <div className="mt-4"><label className="text-xs font-semibold" htmlFor="venue-manage-url">Enlace privado</label><input id="venue-manage-url" readOnly value={url} onFocus={(event) => event.target.select()} className="mt-1 min-h-12 w-full rounded-lg border border-[#741314]/25 bg-[#FFF7E8] px-3 text-sm" autoComplete="off" /></div> : null}
      {confirmRotation ? <div className="mt-4 rounded-xl bg-[#FFF7E8] p-4"><p className="text-sm font-semibold">El enlace anterior dejará de funcionar, también si el comercio lo tiene abierto.</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" className={buttonClass} disabled={busy} onClick={() => loadLink(true)}>Sí, regenerar</button><button type="button" className={buttonClass} disabled={busy} onClick={() => setConfirmRotation(false)}>Cancelar</button></div></div> : null}
      <p role="status" className="mt-3 text-sm">{busy ? "Preparando enlace…" : message}</p>
    </section>
  );
}
