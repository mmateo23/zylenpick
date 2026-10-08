import { DemoDishesCarousel } from "@/components/demo/demo-dishes-carousel";
import type { SiteChip } from "@/features/chips/types";
import type { SiteFunnelSettings } from "@/features/funnel/site-funnel-settings";
import type { HomeShowcaseItem } from "@/features/venues/types";
import type { DiscoveryVenue, DiscoveryShot } from "@/features/discovery/discovery-content";

import { serviceShowcaseTemplate } from "./service-showcase-template";

type ServiceShowcaseDishesTemplateProps = {
  items: HomeShowcaseItem[];
  venues?: DiscoveryVenue[];
  shots?: DiscoveryShot[];
  funnelSettings?: SiteFunnelSettings;
  chips?: SiteChip[];
  heroImageUrl?: string;
  mapboxAccessToken: string;
  locationPickerCenter: { latitude: number; longitude: number };
};

export function ServiceShowcaseDishesTemplate({
  items,
  venues,
  shots,
  funnelSettings,
  chips,
  heroImageUrl,
  mapboxAccessToken,
  locationPickerCenter,
}: ServiceShowcaseDishesTemplateProps) {
  return (
    <DemoDishesCarousel
      items={items}
      venues={venues}
      shots={shots}
      funnelSettings={funnelSettings}
      chips={chips}
      heroImageUrl={heroImageUrl}
      mapboxAccessToken={mapboxAccessToken}
      locationPickerCenter={locationPickerCenter}
      template={serviceShowcaseTemplate.dishes}
    />
  );
}
