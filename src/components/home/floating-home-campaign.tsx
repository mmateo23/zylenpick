"use client";

import { ArrowUpRight, CalendarDays, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import styles from "./home-campaign.module.css";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { CampaignIcon } from "@/components/home/home-campaign-cta";
import {
  isHomeCampaignActive,
  normalizeSiteDesignConfig,
  type HomeCampaignConfig,
} from "@/features/design/site-design-config";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const HIDDEN_PREFIXES = [
  "/manage",
  "/panel",
  "/acceder",
  "/cart",
  "/carrito",
  "/checkout",
  "/pedidos",
  "/explora",
  "/q/",
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
      if (event.key === "Escape") {
        setIsExpanded(false);
        requestAnimationFrame(() => document.getElementById("floating-campaign-trigger")?.focus());
      }
    };

    const frame = requestAnimationFrame(() => document.getElementById("floating-campaign-close")?.focus());
    window.addEventListener("keydown", handleEscape);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleEscape);
    };
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
    <aside aria-label="Evento destacado" className={styles.floating}>
      {isExpanded ? (
        <section id="floating-campaign-details" aria-labelledby="floating-campaign-title" className={styles.popover}>
          <header className={styles.popoverHeader}>
            <span className={styles.eyebrow}>
              <CampaignIcon campaign={campaign} compact />
              {campaign.eyebrow || "Evento destacado"}
            </span>
            <button
              id="floating-campaign-close"
              type="button"
              onClick={() => { setIsExpanded(false); setIsDismissed(true); }}
              aria-label="Cerrar evento destacado"
              className={styles.close}
            >
              <X size={20} aria-hidden="true" />
            </button>
          </header>
          <h2 id="floating-campaign-title" className={styles.popoverTitle}>{campaign.title}</h2>
          {campaign.featureImageEnabled && campaign.featureImageUrl ? (
            <span className={styles.popoverVisual} aria-hidden="true">
              <Image src={campaign.featureImageUrl} alt="" fill sizes="310px" />
            </span>
          ) : null}
          <p className={styles.date}><CalendarDays size={18} aria-hidden="true" /><span>{dateLabel}</span></p>
          <CampaignInformationLink campaign={campaign} />
        </section>
      ) : (
        <button
          id="floating-campaign-trigger"
          type="button"
          onClick={() => setIsExpanded(true)}
          aria-expanded={false}
          aria-controls="floating-campaign-details"
          aria-label={`Abrir evento: ${campaign.title}`}
          title={campaign.title}
          className={styles.trigger}
        >
          <CampaignIcon campaign={campaign} compact />
        </button>
      )}
    </aside>
  );
}
