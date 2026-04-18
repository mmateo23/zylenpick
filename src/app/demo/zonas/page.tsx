import type { Metadata } from "next";

import { DemoZonesOverview } from "@/components/demo/demo-zones-overview";
import { getCities } from "@/features/cities/services/cities-service";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Demo Zonas | ZylenPick",
  description:
    "Ruta de demo para explorar ciudades activas con una composición visual editorial.",
  robots: { index: false, follow: false },
};

export default async function DemoZonasPage() {
  const cities = isSupabaseConfigured() ? await getCities() : [];

  return <DemoZonesOverview cities={cities} />;
}
