import type { Metadata } from "next";

import { VenuesMap } from "@/components/venues-map/venues-map";
import { getVenuesForMap } from "@/features/venues/services/venues-map-service";
import { getNoIndexMetadata } from "@/lib/seo";

export const revalidate = 900;

export const metadata: Metadata = getNoIndexMetadata({
  title: "Mapa de locales | ZylenPick",
  description: "Ruta aislada para probar un mapa visual de locales.",
});

export default async function MapaPage() {
  const venues = await getVenuesForMap();

  return (
    <VenuesMap
      accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ""}
      venues={venues}
    />
  );
}
