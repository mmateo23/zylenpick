"use client";

import { ArrowRight, EyeOff } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { HomeCampaignIconLink } from "@/components/home/home-campaign-cta";
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
  "/cookies",
  "/privacidad",
];

function shouldShowOnPath(pathname: string) {
  return pathname !== "/" && !HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function FloatingHomeCampaign() {
  const pathname = usePathname();
  const [campaign, setCampaign] = useState<HomeCampaignConfig | null>(null);
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
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

  const campaignKey = useMemo(
    () => campaign ? `${campaign.title}|${campaign.startsOn}|${campaign.endsOn}` : "",
    [campaign],
  );

  useEffect(() => {
    if (!campaignKey) return;
    setDismissedKey(window.localStorage.getItem("pickyalo.dismissed-campaign"));
  }, [campaignKey]);

  const active = campaign
    ? process.env.NODE_ENV === "development" || isHomeCampaignActive(campaign)
    : false;

  if (!isEligiblePath || !campaign || !active || dismissedKey === campaignKey) {
    return null;
  }

  return (
    <aside
      aria-label="Evento destacado"
      className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-3 z-[35] sm:bottom-5 sm:right-5"
    >
      <div className="flex items-center justify-end gap-1.5">
        <div className="flex h-11 items-center rounded-full border border-[#741314]/18 bg-[#FFF7E8]/92 pl-1 pr-2 text-[#741314] shadow-[0_12px_32px_rgba(56,25,50,0.16)] backdrop-blur-xl">
          <button
            type="button"
            onClick={() => {
              window.localStorage.setItem("pickyalo.dismissed-campaign", campaignKey);
              setDismissedKey(campaignKey);
            }}
            aria-label="Ocultar evento destacado"
            title="Ocultar evento"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:bg-[#741314]/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314]"
          >
            <EyeOff aria-hidden="true" className="h-[1.1rem] w-[1.1rem]" strokeWidth={2} />
          </button>
          <span className="hidden text-[10px] font-black uppercase tracking-[0.14em] min-[360px]:inline">
            Evento
          </span>
          <ArrowRight aria-hidden="true" className="ml-1 h-4 w-4" strokeWidth={2.25} />
        </div>
        <HomeCampaignIconLink campaign={campaign} />
      </div>
    </aside>
  );
}
