import {
  defaultSiteDesignConfig,
  normalizeSiteDesignConfig,
  type SiteDesignConfig,
} from "@/features/design/site-design-config";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

const DESIGN_SETTING_KEYS = ["texts", "media", "zones"] as const;

export async function getSiteDesignConfig(): Promise<SiteDesignConfig> {
  if (!isSupabaseConfigured()) {
    return defaultSiteDesignConfig;
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_design_settings")
    .select("key, value")
    .in("key", [...DESIGN_SETTING_KEYS]);

  if (error) {
    return defaultSiteDesignConfig;
  }

  const rows = data.reduce<Partial<Record<string, Json>>>((map, row) => {
    map[row.key] = row.value;
    return map;
  }, {});

  return normalizeSiteDesignConfig(rows);
}
