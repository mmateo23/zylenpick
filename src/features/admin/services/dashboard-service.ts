import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminDashboardSummary = {
  venuesCount: number | null;
  menuItemsCount: number | null;
  joinRequestsCount: number | null;
};

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  if (!isSupabaseConfigured()) {
    return {
      venuesCount: null,
      menuItemsCount: null,
      joinRequestsCount: null,
    };
  }

  const supabase = createSupabaseServerClient();

  const [
    { count: venuesCount, error: venuesError },
    { count: menuItemsCount, error: menuItemsError },
    { count: joinRequestsCount, error: joinRequestsError },
  ] =
    await Promise.all([
      supabase.from("venues").select("*", { count: "exact", head: true }),
      supabase.from("menu_items").select("*", { count: "exact", head: true }),
      supabase.from("join_requests").select("*", { count: "exact", head: true }),
    ]);

  if (venuesError) {
    throw new Error(`Unable to load venues count: ${venuesError.message}`);
  }

  if (menuItemsError) {
    throw new Error(`Unable to load menu items count: ${menuItemsError.message}`);
  }

  if (joinRequestsError) {
    throw new Error(
      `Unable to load join requests count: ${joinRequestsError.message}`,
    );
  }

  return {
    venuesCount: venuesCount ?? 0,
    menuItemsCount: menuItemsCount ?? 0,
    joinRequestsCount: joinRequestsCount ?? 0,
  };
}
