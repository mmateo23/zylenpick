import type { Metadata } from "next";

import { DemoBentoGallery } from "@/components/demo/demo-bento-gallery";
import { getHomeShowcase } from "@/features/venues/services/venues-service";
import type { HomeShowcaseItem } from "@/features/venues/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Demo Locales | ZylenPick",
  description: "Ruta de demo para explorar locales con una dirección visual editorial.",
  robots: {
    index: false,
    follow: false,
  },
};

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

export default async function DemoLocalesPage() {
  const showcase = isSupabaseConfigured()
    ? await getHomeShowcase()
    : { featuredItems: [], latestItems: [] };

  const items = dedupeItems([
    ...showcase.featuredItems,
    ...showcase.latestItems,
    ...showcase.featuredItems,
  ]);

  return <DemoBentoGallery items={items} />;
}
