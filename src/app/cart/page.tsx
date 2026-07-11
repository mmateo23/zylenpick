import type { Metadata } from "next";

import { SiteHeader } from "@/components/layout/site-header";
import { ZylenPickFooter } from "@/components/layout/zylenpick-footer";
import { getSiteDesignConfig } from "@/features/design/services/site-design-service";
import { CartScreen } from "@/features/cart/components/cart-screen";
import { getNoIndexMetadata } from "@/lib/seo";

const cartTicketHeroImageUrl =
  "https://images.unsplash.com/photo-1528459105426-b9548367069b?q=85&w=1800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export const metadata: Metadata = getNoIndexMetadata({
  title: "Tu cesta",
  description: "Revisa tu selección para recoger en el local.",
});

export default async function CartPage() {
  const design = await getSiteDesignConfig();

  return (
    <div className="relative min-h-screen bg-page text-text-primary">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-cover bg-center"
        style={{ backgroundImage: `url(${cartTicketHeroImageUrl})` }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(36,17,14,0.16),rgba(253,227,173,0.78))]" />
      <SiteHeader />
      <CartScreen design={design} />
      <ZylenPickFooter theme="light" />
    </div>
  );
}
