import type { Metadata } from "next";

import { DemoZonesOverview } from "@/components/demo/demo-zones-overview";
import { getCities } from "@/features/cities/services/cities-service";
import { getSiteDesignConfig } from "@/features/design/services/site-design-service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getBaseMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = getBaseMetadata({
  title: "Zonas con locales cercanos",
  description:
    "Explora zonas activas, entra en cada una y descubre productos y platos destacados de locales cercanos para recoger.",
  path: "/zonas",
});

export default async function ZonesPage() {
  const [cities, design] = await Promise.all([
    isSupabaseConfigured() ? getCities() : Promise.resolve([]),
    getSiteDesignConfig(),
  ]);

  return <DemoZonesOverview cities={cities} variant="public" design={design} />;
}
