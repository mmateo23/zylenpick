import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { OwnedVenue, UserProfile } from "@/features/auth/types";

type ProfileRecord = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "customer" | "merchant";
};

type VenueMembershipRecord = {
  membership_role: "owner" | "manager" | "editor";
  venues: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const profile = data as ProfileRecord | null;

  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    email: profile.email ?? user.email ?? "",
    fullName: profile.full_name,
    role: profile.role,
  };
}

export async function getOwnedVenuesForCurrentUser(): Promise<OwnedVenue[]> {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("venue_memberships")
    .select(
      `
        membership_role,
        venues:venue_id (
          id,
          name,
          slug
        )
      `,
    )
    .eq("profile_id", user.id)
    .order("created_at", { ascending: true });

  return ((data ?? []) as VenueMembershipRecord[])
    .map((membership) => {
      if (!membership.venues) {
        return null;
      }

      return {
        id: membership.venues.id,
        name: membership.venues.name,
        slug: membership.venues.slug,
        membershipRole: membership.membership_role,
      };
    })
    .filter((membership): membership is OwnedVenue => Boolean(membership));
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/acceder");
  }

  return user;
}

export async function requireMerchant() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/acceder");
  }

  if (profile.role !== "merchant") {
    redirect("/cuenta");
  }

  return profile;
}

export async function userOwnsVenue(venueId: string) {
  const venues = await getOwnedVenuesForCurrentUser();

  return venues.some((venue) => venue.id === venueId);
}
