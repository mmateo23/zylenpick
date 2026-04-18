import type { Metadata } from "next";
import { PlaceholderScreen } from "@/components/layout/placeholder-screen";
import { getNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = getNoIndexMetadata({
  title: "Carrito",
  description: "Área privada del carrito de compra.",
});

export default function CartPage() {
  return (
    <PlaceholderScreen
      eyebrow="Carrito"
      title="Un solo restaurante por pedido"
      description="Esta pantalla queda lista para conectar el carrito persistente del MVP y su regla de conflicto entre comercios."
    />
  );
}
