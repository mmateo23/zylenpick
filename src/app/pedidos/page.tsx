import type { Metadata } from "next";
import { PlaceholderScreen } from "@/components/layout/placeholder-screen";
import { getNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = getNoIndexMetadata({
  title: "Pedidos",
  description: "Área privada para consultar pedidos del usuario.",
});

export default function OrdersPage() {
  return (
    <PlaceholderScreen
      eyebrow="Pedidos"
      title="Seguimiento simple del pedido"
      description="Aquí conectaremos el historial y el estado del pedido cuando entremos en la fase de checkout y órdenes."
    />
  );
}
