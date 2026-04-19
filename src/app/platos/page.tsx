import type { Metadata } from "next";

import { getActiveSiteChips } from "@/features/chips/services/site-chips-service";
import { getSiteFunnelSettings } from "@/features/funnel/services/site-funnel-service";
import { getHomeShowcase } from "@/features/venues/services/venues-service";
import type { HomeShowcaseItem } from "@/features/venues/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getBaseMetadata } from "@/lib/seo";
import { ServiceShowcaseDishesTemplate } from "@/templates/service-showcase/service-showcase-dishes-template";

export const revalidate = 900;

export const metadata: Metadata = getBaseMetadata({
  title: "Platos para recoger cerca de ti",
  description:
    "Explora platos destacados, propuestas visuales y comida local para recoger sin esperas innecesarias.",
  path: "/platos",
});

function dedupeItems(items: HomeShowcaseItem[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.id) || !item.imageUrl) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

export default async function DishesPage() {
  const [showcase, funnelSettings, chips] = await Promise.all([
    isSupabaseConfigured()
      ? getHomeShowcase()
      : Promise.resolve({ featuredItems: [], latestItems: [] }),
    getSiteFunnelSettings(),
    getActiveSiteChips(),
  ]);

  const items = dedupeItems([
    ...showcase.featuredItems,
    ...showcase.latestItems,
    ...showcase.featuredItems,
  ]);

  return (
    <ServiceShowcaseDishesTemplate
      items={items}
      funnelSettings={funnelSettings}
      chips={chips}
    />
  );
}
