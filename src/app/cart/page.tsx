import type { Metadata } from "next";

import { SiteHeader } from "@/components/layout/site-header";
import { ZylenPickFooter } from "@/components/layout/zylenpick-footer";
import { CartScreen } from "@/features/cart/components/cart-screen";
import { getNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = getNoIndexMetadata({
  title: "Carrito",
  description: "Área privada del carrito de compra.",
});

export default function CartPage() {
  return (
    <div className="min-h-screen bg-[#f6f1e6] text-[#181816]">
      <SiteHeader />
      <CartScreen />
      <ZylenPickFooter />
    </div>
  );
}
