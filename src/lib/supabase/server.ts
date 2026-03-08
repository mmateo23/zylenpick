import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

export function createSupabaseServerClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set({
              name,
              value,
              ...options,
            });
          } catch {
            // Ignorado en componentes del servidor sin capacidad de escritura.
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({
              name,
              value: "",
              ...options,
            });
          } catch {
            // Ignorado en componentes del servidor sin capacidad de escritura.
          }
        },
      },
    },
  );
}
