import { SiteHeader } from "@/components/layout/site-header";
// Keep the existing gallery API; share the single public navigation.
export function DemoSiteHeader(_props: {
  currentCityName?: string | null;
  currentCitySlug?: string | null;
  isLightTheme: boolean;
}) {
  void _props;
  return <SiteHeader />;
}
