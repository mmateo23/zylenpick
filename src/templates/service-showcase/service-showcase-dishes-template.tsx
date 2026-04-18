import { DemoDishesCarousel } from "@/components/demo/demo-dishes-carousel";
import type { HomeShowcaseItem } from "@/features/venues/types";

import { serviceShowcaseTemplate } from "./service-showcase-template";

type ServiceShowcaseDishesTemplateProps = {
  items: HomeShowcaseItem[];
};

export function ServiceShowcaseDishesTemplate({
  items,
}: ServiceShowcaseDishesTemplateProps) {
  return (
    <DemoDishesCarousel
      items={items}
      template={serviceShowcaseTemplate.dishes}
    />
  );
}
