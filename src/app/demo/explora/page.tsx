import { notFound } from "next/navigation";

import { ExplorePointExperience } from "@/components/explore/explore-point-experience";
import type { PublicExploreExperience } from "@/features/explore/types";

const previewExperience: PublicExploreExperience = {
  route: {
    id: "preview-route",
    slug: "ruta-de-la-ceramica",
    name: "Ruta de la cerámica",
    description: "Vista previa editorial de Pickyalo Explora.",
    coverImageUrl: "/home/zonas/talavera-poster-local.webp",
    availableLanguages: ["es"],
    credits: "Vista previa de diseño. El contenido final se gestiona desde el panel.",
    cityName: "Talavera de la Reina",
  },
  point: {
    id: "preview-point-1",
    slug: "jardines-del-prado",
    publicToken: "preview",
    position: 3,
    title: "La ciudad también se lee",
    introduction: "Una historia escondida entre cerámica, calles y memoria local.",
    story:
      "Esta es una vista previa de la experiencia editorial de Pickyalo Explora. El relato final, sus fuentes, la fotografía, el audio y la transcripción se cargarán desde el panel.\n\nCada parada está pensada para descubrir un lugar sin convertir la visita en una lista interminable de datos.",
    transcript:
      "Transcripción de demostración. El contenido definitivo se administra desde Pickyalo y solo se publica después de revisarlo.",
    audioUrl: "",
    audioDurationSeconds: 134,
    imageUrl: "/home/zonas/talavera-poster-local.webp",
    imageAlt: "Cerámica y patrimonio de Talavera de la Reina",
    artisticMapUrl: "/zones/talavera/talavera_de_la_reina_emerald.svg",
    latitude: 39.956,
    longitude: -4.831,
    credits: "Contenido de demostración, no publicado.",
    place: {
      id: "preview-place-1",
      name: "Jardines del Prado",
      category: "monument",
    },
  },
  nextPoint: {
    id: "preview-point-2",
    slug: "siguiente-parada",
    publicToken: "preview-next",
    position: 4,
    title: "La siguiente historia",
    latitude: 39.9575,
    longitude: -4.8287,
  },
  totalPoints: 6,
  sponsor: null,
};

export default function ExploreDesignPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  return <ExplorePointExperience experience={previewExperience} preview />;
}
