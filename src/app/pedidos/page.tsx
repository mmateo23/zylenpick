import type { Metadata } from "next";

import { ActiveOrderEntry } from "@/app/pedidos/active-order-entry";
import { getNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = getNoIndexMetadata({
  title: "Pedidos",
  description: "Consulta el estado de tu pedido activo en ZylenPick.",
});

export default function OrdersPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <ActiveOrderEntry />
    </main>
  );
}
