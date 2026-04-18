import type { Metadata } from "next";

import { SiteHeader } from "@/components/layout/site-header";
import { ZylenPickFooter } from "@/components/layout/zylenpick-footer";
import { getSiteDesignConfig } from "@/features/design/services/site-design-service";
import { CartScreen } from "@/features/cart/components/cart-screen";
import { getNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = getNoIndexMetadata({
  title: "Carrito",
  description: "Revisa tu pedido para recoger en el local.",
});

export default async function CartPage() {
  const design = await getSiteDesignConfig();

  return (
    <div className="min-h-screen bg-page text-text-primary">
      <SiteHeader />
      <CartScreen design={design} />
      <ZylenPickFooter />
    </div>
  );
}
