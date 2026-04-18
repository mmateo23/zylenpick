import type { Metadata } from "next";
import { PlaceholderScreen } from "@/components/layout/placeholder-screen";
import { getNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = getNoIndexMetadata({
  title: "Favoritos",
  description: "Área privada de favoritos y guardados.",
});

export default function FavoritesPage() {
  return (
    <PlaceholderScreen
      eyebrow="Favoritos"
      title="Tus guardados aparecerán aquí"
      description="Base de navegación preparada para la futura persistencia de favoritos y colecciones personales."
    />
  );
}
