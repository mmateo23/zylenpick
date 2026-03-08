import { HomeLanding } from "@/components/home/home-landing";
import { getCities } from "@/features/cities/services/cities-service";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function HomePage() {
  const configured = isSupabaseConfigured();
  const cities = configured ? await getCities() : [];

  return <HomeLanding cities={cities} isConfigured={configured} />;
}
