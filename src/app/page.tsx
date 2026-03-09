import { HomeLanding } from "@/components/home/home-landing";
import { getCities } from "@/features/cities/services/cities-service";
import { getHomeShowcase } from "@/features/venues/services/venues-service";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function HomePage() {
  const configured = isSupabaseConfigured();
  const cities = configured ? await getCities() : [];
  const showcase = configured
    ? await getHomeShowcase()
    : { featuredItems: [], latestItems: [] };

  return (
    <HomeLanding
      cities={cities}
      isConfigured={configured}
      featuredItems={showcase.featuredItems}
      latestItems={showcase.latestItems}
    />
  );
}
