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
    id: "demo-tables",
    name: "Ejemplo · mesas con sombra",
    description: "Zona de descanso con mesas y bancos. Punto ficticio para validar el diseño.",
    category: "tables",
    iconName: "table",
    latitude: 39.9588,
    longitude: -4.8319,
    amenities: ["Mesas", "Bancos", "Sombra"],
    isAccessible: true,
    city: talavera,
  },
  {
    id: "demo-playground",
    name: "Ejemplo · juegos infantiles",
    description: "Área infantil representada con un pictograma propio de Pickyalo.",
    category: "playground",
    iconName: "blocks",
    latitude: 39.9601,
    longitude: -4.8278,
    amenities: ["Juegos", "Banco cercano"],
    isAccessible: false,
    city: talavera,
  },
  {
    id: "demo-fountain",
    name: "Ejemplo · fuente pública",
    description: "Un servicio puntual que se puede localizar de un vistazo.",
    category: "fountain",
    iconName: "droplets",
    latitude: 39.9572,
    longitude: -4.8288,
    amenities: ["Agua"],
    isAccessible: true,
    city: talavera,
  },
  {
    id: "demo-monument",
    name: "Ejemplo · punto monumental",
    description: "Lugar cultural pensado para enriquecer la exploración turística.",
    category: "monument",
    iconName: "landmark",
    latitude: 39.962,
    longitude: -4.8337,
    amenities: ["Interés cultural"],
    isAccessible: false,
    city: talavera,
  },
  {
    id: "demo-toilets",
    name: "Ejemplo · aseos públicos",
    description: "Información práctica accesible desde la misma vista del mapa.",
    category: "toilets",
    iconName: "toilets",
    latitude: 39.959,
    longitude: -4.8362,
    amenities: ["Aseos"],
    isAccessible: true,
    city: talavera,
  },
  {
    id: "demo-parking",
    name: "Ejemplo · aparcamiento",
    description: "Punto orientativo para valorar la lectura del icono a escala pequeña.",
    category: "parking",
    iconName: "parking",
    latitude: 39.9559,
    longitude: -4.8349,
    amenities: ["Aparcamiento"],
    isAccessible: true,
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
