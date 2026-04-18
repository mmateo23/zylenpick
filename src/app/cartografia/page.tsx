import type { Metadata } from "next";

import { MapArtStudio } from "@/components/map-art/map-art-studio";
import { getBaseMetadata } from "@/lib/seo";

export const metadata: Metadata = getBaseMetadata({
  title: "Cartografía editorial",
  description:
    "Genera cuadros cartográficos tipo collage a partir de una ciudad, barrio o dirección.",
  path: "/cartografia",
});

export default function CartografiaPage() {
  return <MapArtStudio initialQuery="Madrid, España" />;
}
