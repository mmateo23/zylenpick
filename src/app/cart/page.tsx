import type { Metadata } from "next";
import type { CSSProperties } from "react";

import { SiteHeader } from "@/components/layout/site-header";
import { ZylenPickFooter } from "@/components/layout/zylenpick-footer";
import { getSiteDesignConfig } from "@/features/design/services/site-design-service";
import { CartScreen } from "@/features/cart/components/cart-screen";
import { getSiteMediaAssetMap } from "@/features/site-media/services/site-media-service";
import { getNoIndexMetadata } from "@/lib/seo";

const cartLightThemeStyle = {
  "--bg-page": "#fcfaf5",
  "--bg-page-alt": "#FFF7E8",
  "--bg-surface": "rgba(255, 247, 232, 0.88)",
  "--bg-surface-strong": "#FFF7E8",
  "--bg-surface-muted": "rgba(253, 227, 173, 0.42)",
  "--text-primary": "#24110E",
  "--text-secondary": "rgba(36, 17, 14, 0.68)",
  "--text-muted": "rgba(36, 17, 14, 0.48)",
  "--border-subtle": "rgba(116, 19, 20, 0.16)",
  "--shadow-soft": "0 18px 60px rgba(116, 19, 20, 0.12)",
} as CSSProperties;

export const metadata: Metadata = getNoIndexMetadata({
  title: "Tu cesta",
  description: "Revisa tu selección para recoger en el local.",
});

export default async function CartPage() {
  const [design, siteMedia] = await Promise.all([
    getSiteDesignConfig(),
    getSiteMediaAssetMap(),
  ]);

  return (
    <div
      className="relative min-h-screen bg-[#fcfaf5] text-[#24110E]"
      style={cartLightThemeStyle}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-cover bg-center opacity-45"
        style={{ backgroundImage: `url(${siteMedia.cart_active_hero.imageUrl})` }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(252,250,245,0.72),rgba(252,250,245,0.96))]" />
      <SiteHeader />
      <CartScreen
        design={design}
        emptyHeroImageUrl={siteMedia.cart_empty_hero.imageUrl}
        activeHeroImageUrl={siteMedia.cart_active_hero.imageUrl}
      />
      <ZylenPickFooter theme="light" />
    </div>
  );
}
