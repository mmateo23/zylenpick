import { notFound, redirect } from "next/navigation";

import {
  createAdminDataClient,
  createAdminMutationClient,
} from "@/features/admin/services/admin-auth";
import type { JoinInterest } from "@/features/join/join-interest";

export type AdminJoinRequestStatus = "pending" | "approved" | "rejected";

export type AdminJoinRequestListItem = {
  id: string;
  venueName: string;
  area: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  interest: JoinInterest | null;
  status: AdminJoinRequestStatus;
  linkedVenueId: string | null;
  createdAt: string;
};

export type AdminJoinRequestListResult = {
  items: AdminJoinRequestListItem[];
  total: number;
  page: number;
  pageSize: number;
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
  interest: JoinInterest | null;
  message: string | null;
  privacyAccepted: boolean;
  status: AdminJoinRequestStatus;
  linkedVenueId: string | null;
  createdAt: string;
};

export async function getAdminJoinRequests({
  query = "",
  status = "",
  page = 1,
  pageSize = 25,
}: {
  query?: string;
  status?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<AdminJoinRequestListResult> {
  const supabase = await createAdminDataClient();
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * pageSize;
  let requestQuery = supabase
    .from("join_requests")
    .select(
      "id, venue_name, area, contact_name, contact_email, contact_phone, interest, status, linked_venue_id, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (query.trim()) requestQuery = requestQuery.ilike("venue_name", `%${query.trim()}%`);
  if (["pending", "approved", "rejected"].includes(status)) {
    requestQuery = requestQuery.eq(
      "status",
      status as "pending" | "approved" | "rejected",
    );
  }

  const { data, error, count } = await requestQuery;

  if (error) {
    throw new Error(`Unable to load admin join requests: ${error.message}`);
  }

  return {
    items: data.map((item) => ({
      id: item.id,
      venueName: item.venue_name,
      area: item.area,
      contactName: item.contact_name,
      contactEmail: item.contact_email,
      contactPhone: item.contact_phone,
      interest: item.interest,
      status: item.status,
      linkedVenueId: item.linked_venue_id,
      createdAt: item.created_at,
    })),
    total: count ?? 0,
    page: safePage,
    pageSize,
  };
}

export async function getAdminJoinRequestById(
  requestId: string,
): Promise<AdminJoinRequestDetail | null> {
  const supabase = await createAdminDataClient();
  const { data, error } = await supabase
    .from("join_requests")
    .select(
      "id, venue_name, business_type, area, address, venue_phone, venue_email, website, contact_name, contact_phone, contact_email, service_type, interest, message, privacy_accepted, status, linked_venue_id, created_at",
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
    interest: data.interest,
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

  const supabase = await createAdminMutationClient();
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

export async function deleteJoinRequestAction(requestId: string) {
  "use server";

  const supabase = await createAdminMutationClient();
  const { data, error } = await supabase
    .from("join_requests")
    .select("linked_venue_id")
    .eq("id", requestId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to validate join request deletion: ${error.message}`);
  }

  if (!data) {
    redirect("/panel/solicitudes");
  }

  if (data.linked_venue_id) {
    throw new Error(
      "No se puede eliminar una solicitud que ya está vinculada a un local.",
    );
  }

  const { error: deleteError } = await supabase
    .from("join_requests")
    .delete()
    .eq("id", requestId);

  if (deleteError) {
    throw new Error(`Unable to delete join request: ${deleteError.message}`);
  }

  redirect("/panel/solicitudes");
}
