import {
  defaultSiteFunnelSettings,
  normalizeSiteFunnelSettings,
  type SiteFunnelSettings,
} from "@/features/funnel/site-funnel-settings";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

const FUNNEL_SETTING_KEYS = ["platos"] as const;

export async function getSiteFunnelSettings(): Promise<SiteFunnelSettings> {
  if (!isSupabaseConfigured()) {
    return defaultSiteFunnelSettings;
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_funnel_settings")
    .select("key, value")
    .in("key", [...FUNNEL_SETTING_KEYS]);

  if (error) {
    return defaultSiteFunnelSettings;
  }

  const rows = data.reduce<Partial<Record<string, Json>>>((map, row) => {
    map[row.key] = row.value;
    return map;
  }, {});

  return normalizeSiteFunnelSettings(rows);
}
