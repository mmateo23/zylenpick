import type { Metadata } from "next";

import { ActiveOrderEntry } from "@/app/pedidos/active-order-entry";
import { SiteShell } from "@/components/layout/site-shell";
import { getNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = getNoIndexMetadata({
  title: "Pedidos",
  description: "Consulta el estado de tu pedido activo en Pickyalo.",
});

export default function OrdersPage() {
  return (
    <SiteShell>
      <ActiveOrderEntry />
    </SiteShell>
  );
}
