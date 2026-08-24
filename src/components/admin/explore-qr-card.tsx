"use client";

import { Copy, Download, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

type Props = { path: string; fileName: string };

export function ExploreQrCard({ path, fileName }: Props) {
  const [url, setUrl] = useState("");
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    const absoluteUrl = new URL(path, window.location.origin).toString();
    setUrl(absoluteUrl);
    void import("qrcode").then(({ toDataURL }) =>
      toDataURL(absoluteUrl, {
        width: 520,
        margin: 2,
        color: { dark: "#741314", light: "#FFF7E8" },
        errorCorrectionLevel: "M",
      }).then(setQrUrl),
    );
  }, [path]);

  return (
    <aside className="grid gap-4 rounded-2xl border border-[#741314]/12 bg-white p-4 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-center">
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-[#741314]/12 bg-[#FFF7E8]">
        {qrUrl ? (
          // Generated locally from the public URL; no remote image optimization is needed.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrUrl} alt="Código QR de la parada" className="h-full w-full" />
        ) : <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin text-[#741314] motion-reduce:animate-none" />}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#741314]/58">Acceso QR</p>
        <p className="mt-2 break-all text-xs leading-5 text-[#381932]/64">{url || path}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => void navigator.clipboard.writeText(url)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#741314]/16 bg-white px-3 text-sm font-bold text-[#741314]"><Copy aria-hidden="true" className="h-4 w-4" />Copiar URL</button>
          {qrUrl ? <a href={qrUrl} download={`${fileName}.png`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#741314] px-3 text-sm font-bold text-[#FFF7E8]"><Download aria-hidden="true" className="h-4 w-4" />Descargar QR</a> : null}
        </div>
      </div>
    </aside>
  );
}
