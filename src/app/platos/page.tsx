import type { Metadata } from "next";

import { getActiveSiteChips } from "@/features/chips/services/site-chips-service";
import { getSiteFunnelSettings } from "@/features/funnel/services/site-funnel-service";
import { getSiteMediaAssetMap } from "@/features/site-media/services/site-media-service";
import { getMenuItemDisplayImage } from "@/features/venues/menu-item-media";
import { getHomeShowcase } from "@/features/venues/services/venues-service";
import type { HomeShowcaseItem } from "@/features/venues/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getBaseMetadata } from "@/lib/seo";
import { ServiceShowcaseDishesTemplate } from "@/templates/service-showcase/service-showcase-dishes-template";

export const revalidate = 900;

export const metadata: Metadata = getBaseMetadata({
  title: "Productos y platos para recoger cerca de ti",
  description:
    "Explora una selección visual de productos y platos destacados de locales cercanos para recoger sin esperas innecesarias.",
  path: "/platos",
});

function dedupeItems(items: HomeShowcaseItem[]) {
  const seen = new Set<string>();
  const dedupedItems: HomeShowcaseItem[] = [];

  for (const item of items) {
    const imageUrl = getMenuItemDisplayImage(item.name, item.imageUrl);

    if (seen.has(item.id) || !imageUrl) {
      continue;
    }

    seen.add(item.id);
    dedupedItems.push({ ...item, imageUrl });
  }

  return dedupedItems;
}

export default async function DishesPage() {
  const [showcase, funnelSettings, chips, siteMedia] = await Promise.all([
    isSupabaseConfigured()
      ? getHomeShowcase()
      : Promise.resolve({ featuredItems: [], latestItems: [] }),
    getSiteFunnelSettings(),
    getActiveSiteChips(),
    getSiteMediaAssetMap(),
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
      heroImageUrl={siteMedia.dishes_hero.imageUrl}
    />
  );
}
