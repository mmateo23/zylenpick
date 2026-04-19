import { DemoDishesCarousel } from "@/components/demo/demo-dishes-carousel";
import type { SiteChip } from "@/features/chips/types";
import type { SiteFunnelSettings } from "@/features/funnel/site-funnel-settings";
import type { HomeShowcaseItem } from "@/features/venues/types";

import { serviceShowcaseTemplate } from "./service-showcase-template";

type ServiceShowcaseDishesTemplateProps = {
  items: HomeShowcaseItem[];
  funnelSettings?: SiteFunnelSettings;
  chips?: SiteChip[];
};

export function ServiceShowcaseDishesTemplate({
  items,
  funnelSettings,
  chips,
}: ServiceShowcaseDishesTemplateProps) {
  return (
    <DemoDishesCarousel
      items={items}
      funnelSettings={funnelSettings}
      chips={chips}
      template={serviceShowcaseTemplate.dishes}
    />
  );
}
