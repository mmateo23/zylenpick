import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/supabase/config";
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
