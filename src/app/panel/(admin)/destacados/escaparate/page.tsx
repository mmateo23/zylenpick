import Link from "next/link";
import { DiscoveryEditor } from "@/components/admin/discovery-editor";
import { getAdminSiteFunnelSettings } from "@/features/admin/services/funnel-admin-service";
import { getHomeShowcase, getVenuesByCitySlug } from "@/features/venues/services/venues-service";
import { getPublishedExploreMapEntries } from "@/features/explore/services/explore-service";
import { getSiteDesignConfig } from "@/features/design/services/site-design-service";
import { discoverySources } from "@/features/discovery/discovery-content";
import { emptyDiscovery } from "@/features/discovery/discovery-config";

export default async function DiscoveryEditorPage() {
  const settings = await getAdminSiteFunnelSettings();
  const [showcase, rows, explore, design] = await Promise.all([getHomeShowcase(), getVenuesByCitySlug("talavera-de-la-reina"), getPublishedExploreMapEntries(), getSiteDesignConfig()]);
  const items = Array.from(new Map([...showcase.featuredItems, ...showcase.latestItems].map(item => [item.id, item])).values());
  const venues = rows.map(venue => ({...venue,citySlug:"talavera-de-la-reina",cityName:"Talavera de la Reina"}));
  return <main className="mx-auto max-w-5xl space-y-6"><Link href="/panel/destacados" className="text-sm underline">Volver a destacados</Link><header><h1 className="text-4xl font-bold">El escaparate.</h1><p className="mt-3">Locales, productos y lugares conectados.</p></header><DiscoveryEditor initial={settings.platos.discovery ?? emptyDiscovery} sources={discoverySources(explore,venues,items,design.texts.homeCampaign)} venues={venues} items={items} /></main>;
}
