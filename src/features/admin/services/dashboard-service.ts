import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminDashboardSummary = {
  venuesCount: number | null;
  menuItemsCount: number | null;
};

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  if (!isSupabaseConfigured()) {
    return {
      venuesCount: null,
      menuItemsCount: null,
    };
  }

  const supabase = createSupabaseServerClient();

  const [{ count: venuesCount, error: venuesError }, { count: menuItemsCount, error: menuItemsError }] =
    await Promise.all([
      supabase.from("venues").select("*", { count: "exact", head: true }),
      supabase.from("menu_items").select("*", { count: "exact", head: true }),
    ]);

  if (venuesError) {
    throw new Error(`Unable to load venues count: ${venuesError.message}`);
  }

  if (menuItemsError) {
    throw new Error(`Unable to load menu items count: ${menuItemsError.message}`);
  }

  return {
    venuesCount: venuesCount ?? 0,
    menuItemsCount: menuItemsCount ?? 0,
  };
}
