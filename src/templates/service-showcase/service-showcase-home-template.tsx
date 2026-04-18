import { DemoHome } from "@/components/demo/demo-home";
import type { City } from "@/features/cities/types";
import type { HomeShowcaseItem } from "@/features/venues/types";

import { serviceShowcaseTemplate } from "./service-showcase-template";

type ServiceShowcaseHomeTemplateProps = {
  cities: City[];
  heroImageUrl: string;
  featuredItems: HomeShowcaseItem[];
  latestItems: HomeShowcaseItem[];
};

export function ServiceShowcaseHomeTemplate(
  props: ServiceShowcaseHomeTemplateProps,
) {
  return <DemoHome {...props} template={serviceShowcaseTemplate.home} />;
}
