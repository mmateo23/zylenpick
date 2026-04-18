import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  getDefaultSiteMediaAssetMap,
  siteMediaAssetDefinitions,
  type SiteMediaAssetKey,
  type SiteMediaAssetMap,
} from "@/features/site-media/site-media";

export async function getSiteMediaAssetMap(): Promise<SiteMediaAssetMap> {
  const fallbackMap = getDefaultSiteMediaAssetMap();

  if (!isSupabaseConfigured()) {
    return fallbackMap;
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_media_assets")
    .select("key, image_url");

  if (error) {
    return fallbackMap;
  }

  for (const row of data) {
    const key = row.key as SiteMediaAssetKey;
    const defaultAsset = siteMediaAssetDefinitions.find((asset) => asset.key === key);

    if (!defaultAsset) {
      continue;
    }

    fallbackMap[key] = {
      key,
      label: defaultAsset.label,
      description: defaultAsset.description,
      imageUrl: row.image_url?.trim() || defaultAsset.defaultImageUrl,
    };
  }

  return fallbackMap;
}
