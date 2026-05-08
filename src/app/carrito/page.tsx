import type { Metadata } from "next";
import { PlaceholderScreen } from "@/components/layout/placeholder-screen";
import { getNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = getNoIndexMetadata({
  title: "Tu cesta",
  description: "Área privada de la cesta para recoger.",
});

export default function CartPage() {
  return (
    <PlaceholderScreen
      eyebrow="Tu cesta"
      title="Un solo local por recogida"
      description="Esta pantalla queda lista para conectar la cesta persistente del MVP y su regla de conflicto entre locales."
    />
  );
}
