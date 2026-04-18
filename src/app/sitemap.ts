import type { MetadataRoute } from "next";

import { getCities } from "@/features/cities/services/cities-service";
import { getVenuesByCitySlug } from "@/features/venues/services/venues-service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSiteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const currentDate = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/zonas`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/platos`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/el-proyecto`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/unete`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  if (!isSupabaseConfigured()) {
    return staticRoutes;
  }

  const cities = await getCities();
  const cityRoutes: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${siteUrl}/zonas/${city.slug}`,
    lastModified: currentDate,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const venueRouteGroups = await Promise.all(
    cities.map(async (city) => {
      const venues = await getVenuesByCitySlug(city.slug);

      return venues.map((venue) => ({
        url: `${siteUrl}/zonas/${city.slug}/venues/${venue.slug}`,
        lastModified: currentDate,
        changeFrequency: "daily" as const,
        priority: 0.7,
      }));
    }),
  );

  return [...staticRoutes, ...cityRoutes, ...venueRouteGroups.flat()];
}
