"use client";

import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Link2,
  QrCode,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const CHANNELS = [
  { id: "qr", label: "QR impreso", source: "offline", medium: "qr" },
  { id: "instagram", label: "Instagram", source: "instagram", medium: "social" },
  { id: "whatsapp", label: "WhatsApp", source: "whatsapp", medium: "share" },
  { id: "partner", label: "Colaboración", source: "partner", medium: "referral" },
] as const;

type ChannelId = (typeof CHANNELS)[number]["id"];

const fieldClassName =
  "mt-2 min-h-11 w-full rounded-[0.9rem] border border-[#741314]/18 bg-white px-3.5 py-2.5 text-sm text-[#24110E] outline-none transition placeholder:text-[#24110E]/35 focus:border-[#741314] focus:ring-2 focus:ring-[#741314]/12";

export function TrackingLinkGenerator() {
  const [destination, setDestination] = useState("/mapa");
  const [campaignName, setCampaignName] = useState("");
  const [channel, setChannel] = useState<ChannelId>("qr");
  const [source, setSource] = useState("offline");
  const [medium, setMedium] = useState("qr");
  const [content, setContent] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => buildTrackingUrl({ destination, campaignName, source, medium, content }),
    [campaignName, content, destination, medium, source],
  );

  useEffect(() => {
    let cancelled = false;
    setQrDataUrl("");

    if (!result.url) return;

    void import("qrcode")
      .then(({ toDataURL }) =>
        toDataURL(result.url, {
          width: 640,
          margin: 2,
          errorCorrectionLevel: "M",
          color: { dark: "#741314", light: "#FFF7E8" },
        }),
      )
      .then((dataUrl) => {
        if (!cancelled) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl("");
      });

    return () => {
      cancelled = true;
    };
  }, [result.url]);

  function selectChannel(channelId: ChannelId) {
    const selectedChannel = CHANNELS.find((item) => item.id === channelId);
    if (!selectedChannel) return;
    setChannel(channelId);
    setSource(selectedChannel.source);
    setMedium(selectedChannel.medium);
  }

  async function copyLink() {
    if (!result.url) return;

    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="rounded-[1.35rem] border border-[#741314]/12 bg-[#FFF7E8] p-5 shadow-[0_16px_48px_rgba(116,19,20,0.06)] sm:p-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] bg-[#741314] text-[#FFF7E8]">
            <Link2 aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#24110E]">
              Configura el enlace
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#24110E]/58">
              Elige a dónde llega la persona y cómo encontrará el enlace.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-[#24110E]">Destino en Pickyalo</span>
            <input
              type="url"
              inputMode="url"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              placeholder="/mapa o https://www.pickyalo.com/platos"
              className={fieldClassName}
            />
            <span className="mt-1.5 block text-xs leading-5 text-[#24110E]/48">
              Puedes usar una ruta corta como /mapa, /platos o la URL completa.
            </span>
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-[#24110E]">Nombre de campaña</span>
            <input
              autoCapitalize="words"
              value={campaignName}
              onChange={(event) => setCampaignName(event.target.value)}
              placeholder="Ej. Feria de San Mateo 2026"
              className={fieldClassName}
            />
          </label>

          <fieldset className="sm:col-span-2">
            <legend className="text-sm font-semibold text-[#24110E]">Dónde se usará</legend>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CHANNELS.map((item) => {
                const active = channel === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => selectChannel(item.id)}
                    className={`min-h-11 rounded-[0.85rem] border px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2 ${
                      active
                        ? "border-[#741314] bg-[#741314] text-[#FFF7E8]"
                        : "border-[#741314]/16 bg-white text-[#741314] hover:border-[#741314]/38"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className="block">
            <span className="text-sm font-semibold text-[#24110E]">Origen</span>
            <input
              value={source}
              onChange={(event) => setSource(event.target.value)}
              placeholder="instagram"
              className={fieldClassName}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-[#24110E]">Medio</span>
            <input
              value={medium}
              onChange={(event) => setMedium(event.target.value)}
              placeholder="social"
              className={fieldClassName}
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-[#24110E]">
              Variante del enlace <span className="font-normal text-[#24110E]/45">(opcional)</span>
            </span>
            <input
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Ej. cartel-entrada, historia-1 o mesa-12"
              className={fieldClassName}
            />
            <span className="mt-1.5 block text-xs leading-5 text-[#24110E]/48">
              Úsalo para comparar dos carteles o publicaciones de la misma campaña.
            </span>
          </label>
        </div>
      </section>

      <aside className="rounded-[1.35rem] border border-[#741314]/14 bg-white p-5 shadow-[0_18px_52px_rgba(116,19,20,0.08)] sm:p-6">
        <div className="flex items-center gap-2 text-[#741314]">
          <QrCode aria-hidden="true" className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Enlace listo</h2>
        </div>

        {result.url ? (
          <>
            <div className="mx-auto mt-5 aspect-square w-full max-w-[15rem] overflow-hidden rounded-[1rem] border border-[#741314]/12 bg-[#FFF7E8] p-3">
              {qrDataUrl ? (
                // Generated locally from the URL; no campaign data is sent to a third party.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt="Código QR del enlace generado" className="h-full w-full" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs font-semibold text-[#741314]/50">
                  Generando QR…
                </div>
              )}
            </div>

            <div className="mt-5 rounded-[0.9rem] border border-[#741314]/10 bg-[#FFF7E8] p-3">
              <p className="break-all font-mono text-[11px] leading-5 text-[#24110E]/68">
                {result.url}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[0.85rem] bg-[#741314] px-3 text-xs font-semibold text-[#FFF7E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2"
              >
                {copied ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
                {copied ? "Copiado" : "Copiar"}
              </button>
              <a
                href={qrDataUrl || undefined}
                download={`pickyalo-${slugify(campaignName) || "campana"}-qr.png`}
                aria-disabled={!qrDataUrl}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[0.85rem] border border-[#741314] px-3 text-xs font-semibold text-[#741314] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2 aria-disabled:pointer-events-none aria-disabled:opacity-45"
              >
                <Download aria-hidden="true" className="h-4 w-4" />
                Descargar QR
              </a>
            </div>

            <a
              href={result.url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[0.85rem] text-xs font-semibold text-[#741314] underline decoration-[#741314]/25 underline-offset-4"
            >
              Probar enlace
              <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
            </a>

            <div className="mt-5 border-t border-dashed border-[#741314]/22 pt-4 text-xs leading-5 text-[#24110E]/55">
              PostHog registrará la visita como <strong className="text-[#24110E]">campana_visitada</strong> y conservará la campaña en el resto del recorrido.
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-[1rem] border border-dashed border-[#741314]/22 bg-[#FFF7E8] px-4 py-8 text-center text-sm leading-6 text-[#24110E]/55">
            Completa el destino y el nombre de campaña para generar el enlace.
            {result.error ? <p className="mt-2 font-semibold text-[#741314]">{result.error}</p> : null}
          </div>
        )}
      </aside>
    </div>
  );
}

function buildTrackingUrl({
  destination,
  campaignName,
  source,
  medium,
  content,
}: {
  destination: string;
  campaignName: string;
  source: string;
  medium: string;
  content: string;
}) {
  const campaign = slugify(campaignName);
  if (!destination.trim() || !campaign) return { url: "", error: "" };

  try {
    const url = new URL(destination.trim(), "https://www.pickyalo.com");
    if (!isAllowedPickyaloHost(url.hostname)) {
      return { url: "", error: "El destino debe pertenecer a Pickyalo." };
    }

    url.searchParams.set("utm_source", slugify(source) || "direct");
    url.searchParams.set("utm_medium", slugify(medium) || "link");
    url.searchParams.set("utm_campaign", campaign);

    const normalizedContent = slugify(content);
    if (normalizedContent) url.searchParams.set("utm_content", normalizedContent);
    else url.searchParams.delete("utm_content");

    return { url: url.toString(), error: "" };
  } catch {
    return { url: "", error: "Revisa la dirección de destino." };
  }
}

function slugify(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function isAllowedPickyaloHost(hostname: string) {
  return (
    hostname === "pickyalo.com" ||
    hostname === "www.pickyalo.com" ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)
  );
}
