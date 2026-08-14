import type { Metadata } from "next";

import { VenuesMap } from "@/components/venues-map/venues-map";
import type { PublicMapPlace } from "@/features/map-places/types";
import { getVenuesForMap } from "@/features/venues/services/venues-map-service";

export const metadata: Metadata = {
  title: "Demo del mapa | Pickyalo",
  description: "Vista interna para validar lugares e iconos del mapa de Pickyalo.",
  robots: { index: false, follow: false },
};

const talavera = { slug: "talavera-de-la-reina", name: "Talavera de la Reina" };

const demoPlaces: PublicMapPlace[] = [
  {
    id: "demo-mural-prado",
    slug: "ceramica-jardines-prado",
    name: "Cerámica de los Jardines del Prado",
    description: "Un paseo donde la cerámica deja de ser un detalle y se convierte en paisaje de la ciudad.",
    category: "mural",
    iconName: "palette",
    latitude: 39.9572,
    longitude: -4.8288,
    amenities: ["Arte al aire libre", "Paseo", "Fotografía"],
    isAccessible: true,
    coverImageUrl: "/home/zonas/badges/talavera_tile_mural.png",
    story: "Esta ficha demuestra cómo Pickyalo puede presentar el patrimonio con el mismo ritmo visual que un plato: una imagen clara, una historia breve y la información necesaria para decidir si acercarse.\n\nLa posición de esta demostración es orientativa y deberá verificarse desde el panel antes de publicarse.",
    openingHoursNote: "Espacio exterior",
    accessibilityNote: "Recorrido exterior; conviene verificar el acceso concreto antes de publicar.",
    sourceLabel: null,
    sourceUrl: null,
    planRole: "discover",
    isPlanCandidate: true,
    city: talavera,
  },
  {
    id: "demo-murallas",
    slug: "murallas-talavera",
    name: "Murallas de Talavera",
    description: "Una parada para entender la ciudad a través de sus muros, torres y recorridos históricos.",
    category: "monument",
    iconName: "landmark",
    latitude: 39.962,
    longitude: -4.8337,
    amenities: ["Patrimonio", "Paseo exterior"],
    isAccessible: false,
    coverImageUrl: "/home/zonas/talavera-poster-local.webp",
    story: "El post puede combinar contexto histórico, acceso y una propuesta cercana para continuar el recorrido. El contenido definitivo se redactará a partir de fuentes oficiales y revisión editorial.",
    openingHoursNote: "Vista exterior",
    accessibilityNote: null,
    sourceLabel: null,
    sourceUrl: null,
    planRole: "discover",
    isPlanCandidate: true,
    city: talavera,
  },
  {
    id: "demo-alameda",
    slug: "parque-alameda",
    name: "Parque de la Alameda",
    description: "Una zona verde para descansar, pasear y conectar la visita con otros puntos cercanos.",
    category: "park",
    iconName: "tree",
    latitude: 39.9565,
    longitude: -4.831,
    amenities: ["Zona verde", "Bancos", "Sombra"],
    isAccessible: true,
    coverImageUrl: "/home/zonas/talavera-poster.webp",
    story: "Los parques funcionan como nodos útiles dentro del explorador: permiten orientar una ruta, localizar servicios y encontrar un local cercano donde recoger algo.",
    openingHoursNote: "Espacio exterior",
    accessibilityNote: "La accesibilidad concreta se verificará sobre el terreno.",
    sourceLabel: null,
    sourceUrl: null,
    planRole: "enjoy",
    isPlanCandidate: true,
    city: talavera,
  },
  {
    id: "demo-tables",
    slug: "mesas-con-sombra",
    name: "Mesas con sombra",
    description: "Un punto práctico para sentarse después de recoger en un local cercano.",
    category: "tables",
    iconName: "table",
    latitude: 39.9588,
    longitude: -4.8319,
    amenities: ["Mesas", "Bancos", "Sombra"],
    isAccessible: true,
    coverImageUrl: null,
    story: null,
    openingHoursNote: null,
    accessibilityNote: null,
    sourceLabel: null,
    sourceUrl: null,
    planRole: "enjoy",
    isPlanCandidate: true,
    city: talavera,
  },
  {
    id: "demo-playground",
    slug: "zona-juegos",
    name: "Zona de juegos",
    description: "Una referencia visual para encontrar espacios útiles cuando se explora en familia.",
    category: "playground",
    iconName: "blocks",
    latitude: 39.9601,
    longitude: -4.8278,
    amenities: ["Juegos", "Banco cercano"],
    isAccessible: true,
    coverImageUrl: null,
    story: null,
    openingHoursNote: null,
    accessibilityNote: null,
    sourceLabel: null,
    sourceUrl: null,
    planRole: "enjoy",
    isPlanCandidate: true,
    city: talavera,
  },
  {
    id: "demo-parking",
    slug: "aparcamiento-cercano",
    name: "Aparcamiento cercano",
    description: "Un servicio práctico mostrado sin competir con los lugares culturales.",
    category: "parking",
    iconName: "parking",
    latitude: 39.9559,
    longitude: -4.8349,
    amenities: ["Aparcamiento"],
    isAccessible: true,
    coverImageUrl: null,
    story: null,
    openingHoursNote: null,
    accessibilityNote: null,
    sourceLabel: null,
    sourceUrl: null,
    planRole: "support",
    isPlanCandidate: false,
    city: talavera,
  },
];

export default async function DemoMapPage() {
  const venues = await getVenuesForMap();

  return (
    <VenuesMap
      accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ""}
      venues={venues.slice(0, 1)}
      places={demoPlaces}
      demoMode
    />
  );
}
