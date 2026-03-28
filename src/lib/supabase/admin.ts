import { createClient } from "@supabase/supabase-js";

import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

export function createSupabaseAdminClient() {
  if (!isSupabaseAdminConfigured()) {
    throw new Error("Supabase admin credentials are not configured.");
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
