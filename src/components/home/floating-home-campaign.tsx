"use client";

import { ArrowUpRight, CalendarDays, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { CampaignIcon } from "@/components/home/home-campaign-cta";
import { BorderBeam } from "@/components/magicui/border-beam";
import {
  isHomeCampaignActive,
  normalizeSiteDesignConfig,
  type HomeCampaignConfig,
} from "@/features/design/site-design-config";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const HIDDEN_PREFIXES = [
  "/panel",
  "/acceder",
  "/cart",
  "/carrito",
  "/checkout",
  "/pedidos",
  "/explora",
  "/cookies",
  "/privacidad",
];

function shouldShowOnPath(pathname: string) {
  return pathname !== "/" && !HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function formatCampaignDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "";

  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day, 12));
}

function getCampaignDateLabel(campaign: HomeCampaignConfig) {
  const startsOn = formatCampaignDate(campaign.startsOn);
  const endsOn = formatCampaignDate(campaign.endsOn);

  if (startsOn && endsOn && startsOn === endsOn) return startsOn;
  if (startsOn && endsOn) return `${startsOn} — ${endsOn}`;
  if (startsOn) return `Desde el ${startsOn}`;
  if (endsOn) return `Hasta el ${endsOn}`;
  return "Disponible ahora";
}

function CampaignInformationLink({ campaign }: { campaign: HomeCampaignConfig }) {
  const className =
    "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[0.7rem] bg-[#741314] px-4 py-3 text-sm font-bold text-[#FFF7E8] transition hover:bg-[#5F0F10] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF7E8]";
  const content = (
    <>
      Más información
      <ArrowUpRight aria-hidden="true" className="h-4 w-4" strokeWidth={2.25} />
    </>
  );

  if (/^https?:\/\//.test(campaign.href)) {
    return (
      <a
        href={campaign.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={campaign.href} className={className}>
      {content}
    </Link>
  );
}

export function FloatingHomeCampaign() {
  const pathname = usePathname();
  const [campaign, setCampaign] = useState<HomeCampaignConfig | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const isEligiblePath = shouldShowOnPath(pathname);

  useEffect(() => {
    if (!isEligiblePath || campaign) return;

    let cancelled = false;
    const loadCampaign = async () => {
      if (!isSupabaseConfigured()) {
        const fallback = normalizeSiteDesignConfig({}).texts.homeCampaign;
        if (!cancelled) setCampaign(fallback);
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from("site_design_settings")
        .select("value")
        .eq("key", "texts")
        .maybeSingle();
      const nextCampaign = normalizeSiteDesignConfig({
        texts: data?.value,
      }).texts.homeCampaign;
      if (!cancelled) setCampaign(nextCampaign);
    };

    void loadCampaign();
    return () => {
      cancelled = true;
    };
  }, [campaign, isEligiblePath]);

  useEffect(() => {
    setIsExpanded(false);
  }, [pathname]);

  useEffect(() => {
    if (!isExpanded) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsExpanded(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isExpanded]);

  const dateLabel = useMemo(
    () => (campaign ? getCampaignDateLabel(campaign) : ""),
    [campaign],
  );
  const active = campaign
    ? process.env.NODE_ENV === "development" || isHomeCampaignActive(campaign)
    : false;

  if (!isEligiblePath || !campaign || !active || isDismissed) return null;

  return (
    <aside
      aria-label="Evento destacado"
      className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-3 z-[35] sm:bottom-5 sm:right-5"
    >
      <div className="flex flex-col items-end gap-2.5">
        {isExpanded ? (
          <section
            id="floating-campaign-details"
            className="relative isolate w-[min(21rem,calc(100vw-1.5rem))] overflow-hidden rounded-[1.25rem] border border-white/80 bg-[#FFF7E8]/94 p-4 text-[#24110E] shadow-[0_22px_60px_rgba(36,17,14,0.22),0_2px_10px_rgba(36,17,14,0.12),inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-[#741314]/22 backdrop-blur-2xl backdrop-saturate-150"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-3 top-0 h-px bg-white shadow-[0_0_14px_rgba(255,255,255,0.95)]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-16 h-32 w-32 rounded-full bg-white/38 blur-2xl"
            />
            <BorderBeam
              duration={7}
              size={260}
              borderWidth={1.6}
              colorFrom={campaign.accentColor || "#FDE3AD"}
              colorTo="#741314"
              glow
              className="motion-reduce:hidden"
            />

            <header className="relative z-10 flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.8rem] border border-[#741314]/18 bg-[#741314] text-[#FDE3AD] shadow-[0_8px_22px_rgba(116,19,20,0.2)]">
                <CampaignIcon campaign={campaign} compact />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-[11px] font-extrabold uppercase leading-4 text-[#741314]">
                  {campaign.eyebrow || "Evento destacado"}
                </p>
                <h2 className="mt-1 text-balance text-lg font-bold leading-5 text-[#24110E]">
                  {campaign.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setIsDismissed(true);
                }}
                aria-label="Cerrar evento destacado"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#741314]/14 bg-white/64 text-[#741314] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition hover:border-[#741314]/30 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314]"
              >
                <X aria-hidden="true" className="h-5 w-5" strokeWidth={2.25} />
              </button>
            </header>

            <p className="relative z-10 mt-4 flex items-start gap-2 border-y border-[#741314]/16 py-3 text-sm font-semibold leading-5 text-[#5F0F10]">
              <CalendarDays aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              <span>{dateLabel}</span>
            </p>

            <div className="relative z-10 mt-4">
              <CampaignInformationLink campaign={campaign} />
            </div>
          </section>
        ) : null}

        {!isExpanded ? (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            aria-expanded="false"
            aria-controls="floating-campaign-details"
            aria-label={`Abrir evento: ${campaign.title}`}
            title={campaign.title}
            className="group relative isolate inline-flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[1.1rem] border border-white/80 bg-[#FFF7E8]/92 text-[#FDE3AD] shadow-[0_14px_36px_rgba(36,17,14,0.24),0_2px_8px_rgba(36,17,14,0.14),inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-[#741314]/28 backdrop-blur-xl backdrop-saturate-150 transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(36,17,14,0.28),0_0_18px_rgba(253,227,173,0.3)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#741314] focus-visible:ring-offset-2 motion-reduce:transform-none"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-2 top-0 h-px bg-white shadow-[0_0_12px_rgba(255,255,255,0.95)]"
            />
            <BorderBeam
              duration={6}
              size={150}
              borderWidth={1.7}
              colorFrom={campaign.accentColor || "#FDE3AD"}
              colorTo="#741314"
              glow
              className="motion-reduce:hidden"
            />
            <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-[0.78rem] border border-[#741314]/18 bg-[#741314] text-[#FDE3AD] shadow-[0_7px_18px_rgba(116,19,20,0.2)]">
              <CampaignIcon campaign={campaign} compact />
            </span>
          </button>
        ) : null}
      </div>
    </aside>
  );
}
