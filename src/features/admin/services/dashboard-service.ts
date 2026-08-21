import { createAdminDataClient } from "@/features/admin/services/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type AdminDashboardSummary = {
  venuesCount: number | null;
  publishedVenuesCount: number | null;
  menuItemsCount: number | null;
  unavailableMenuItemsCount: number | null;
  pendingJoinRequestsCount: number | null;
  pendingScoutCount: number | null;
};

const emptySummary: AdminDashboardSummary = {
  venuesCount: null,
  publishedVenuesCount: null,
  menuItemsCount: null,
  unavailableMenuItemsCount: null,
  pendingJoinRequestsCount: null,
  pendingScoutCount: null,
};

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  if (!isSupabaseConfigured()) {
    return emptySummary;
  }

  const supabase = await createAdminDataClient();
  const results = await Promise.all([
    supabase.from("venues").select("*", { count: "exact", head: true }),
    supabase
      .from("venues")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("is_published", true),
    supabase.from("menu_items").select("*", { count: "exact", head: true }),
    supabase
      .from("menu_items")
      .select("*", { count: "exact", head: true })
      .eq("is_available", false),
    supabase
      .from("join_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("map_places")
      .select("id", { count: "exact", head: true })
      .eq("capture_method", "scout")
      .eq("status", "draft"),
  ]);

  const firstError = results.find((result) => result.error)?.error;
  if (firstError) {
    throw new Error(`Unable to load admin dashboard: ${firstError.message}`);
  }

  return {
    venuesCount: results[0].count ?? 0,
    publishedVenuesCount: results[1].count ?? 0,
    menuItemsCount: results[2].count ?? 0,
    unavailableMenuItemsCount: results[3].count ?? 0,
    pendingJoinRequestsCount: results[4].count ?? 0,
    pendingScoutCount: results[5].count ?? 0,
  };
}
