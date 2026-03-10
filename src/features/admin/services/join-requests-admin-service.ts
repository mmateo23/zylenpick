import { notFound, redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminJoinRequestStatus = "pending" | "approved" | "rejected";

export type AdminJoinRequestListItem = {
  id: string;
  venueName: string;
  area: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  status: AdminJoinRequestStatus;
  linkedVenueId: string | null;
  createdAt: string;
};

export type AdminJoinRequestDetail = {
  id: string;
  venueName: string;
  businessType: string | null;
  area: string | null;
  address: string | null;
  venuePhone: string | null;
  venueEmail: string | null;
  website: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  serviceType: string | null;
  message: string | null;
  privacyAccepted: boolean;
  status: AdminJoinRequestStatus;
  linkedVenueId: string | null;
  createdAt: string;
};

export async function getAdminJoinRequests(): Promise<AdminJoinRequestListItem[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("join_requests")
    .select(
      "id, venue_name, area, contact_name, contact_email, contact_phone, status, linked_venue_id, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load admin join requests: ${error.message}`);
  }

  return data.map((item) => ({
    id: item.id,
    venueName: item.venue_name,
    area: item.area,
    contactName: item.contact_name,
    contactEmail: item.contact_email,
    contactPhone: item.contact_phone,
    status: item.status,
    linkedVenueId: item.linked_venue_id,
    createdAt: item.created_at,
  }));
}

export async function getAdminJoinRequestById(
  requestId: string,
): Promise<AdminJoinRequestDetail | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("join_requests")
    .select(
      "id, venue_name, business_type, area, address, venue_phone, venue_email, website, contact_name, contact_phone, contact_email, service_type, message, privacy_accepted, status, linked_venue_id, created_at",
    )
    .eq("id", requestId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load admin join request: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    venueName: data.venue_name,
    businessType: data.business_type,
    area: data.area,
    address: data.address,
    venuePhone: data.venue_phone,
    venueEmail: data.venue_email,
    website: data.website,
    contactName: data.contact_name,
    contactPhone: data.contact_phone,
    contactEmail: data.contact_email,
    serviceType: data.service_type,
    message: data.message,
    privacyAccepted: data.privacy_accepted,
    status: data.status,
    linkedVenueId: data.linked_venue_id,
    createdAt: data.created_at,
  };
}

export async function requireAdminJoinRequest(requestId: string) {
  const joinRequest = await getAdminJoinRequestById(requestId);

  if (!joinRequest) {
    notFound();
  }

  return joinRequest;
}

export async function updateJoinRequestStatusAction(
  requestId: string,
  nextStatus: AdminJoinRequestStatus,
) {
  "use server";

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("join_requests")
    .update({
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (error) {
    throw new Error(`Unable to update join request status: ${error.message}`);
  }

  redirect(`/panel/solicitudes/${requestId}`);
}
