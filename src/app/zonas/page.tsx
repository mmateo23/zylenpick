import type { Metadata } from "next";

import { DemoZonesOverview } from "@/components/demo/demo-zones-overview";
import { getCities } from "@/features/cities/services/cities-service";
import { getSiteDesignConfig } from "@/features/design/services/site-design-service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getBaseMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = getBaseMetadata({
  title: "Ciudades y zonas con comida local",
  description:
    "Explora ciudades activas, entra en cada zona y descubre locales preparados para pedidos de comida local y recogida.",
  path: "/zonas",
});

export default async function ZonesPage() {
  const [cities, design] = await Promise.all([
    isSupabaseConfigured() ? getCities() : Promise.resolve([]),
    getSiteDesignConfig(),
  ]);

  return <DemoZonesOverview cities={cities} variant="public" design={design} />;
}
