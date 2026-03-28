import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function isDevelopmentAdminBypassEnabled() {
  return process.env.NODE_ENV === "development";
}

function getAllowedAdminEmails() {
  return (process.env.ADMIN_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  return getAllowedAdminEmails().includes(email.toLowerCase());
}

export async function getAdminSessionState() {
  if (isDevelopmentAdminBypassEnabled()) {
    const fallbackEmail = getAllowedAdminEmails()[0] ?? null;

    return {
      configured: true,
      // Bypass temporal solo para desarrollo local.
      user: { id: "development-admin", email: fallbackEmail } as {
        id: string;
        email: string | null;
      },
      authorized: true,
      email: fallbackEmail,
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      configured: false,
      user: null,
      authorized: false,
      email: null,
    };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    configured: true,
    user,
    authorized: isAdminEmail(user?.email),
    email: user?.email ?? null,
  };
}

export async function requireAdminSession() {
  const sessionState = await getAdminSessionState();

  if (!sessionState.configured) {
    return sessionState;
  }

  if (!sessionState.user) {
    redirect("/panel/login");
  }

  return sessionState;
}

export async function requireAuthorizedAdminSession() {
  const sessionState = await requireAdminSession();

  if (!sessionState.authorized) {
    redirect("/panel/login");
  }

  return sessionState;
}

export async function createAdminMutationClient() {
  const sessionState = await requireAuthorizedAdminSession();

  if (isSupabaseAdminConfigured()) {
    return createSupabaseAdminClient();
  }

  if (sessionState.user?.id === "development-admin") {
    throw new Error(
      "Las acciones de escritura del panel en desarrollo requieren SUPABASE_SERVICE_ROLE_KEY en .env.local.",
    );
  }

  return createSupabaseServerClient();
}
