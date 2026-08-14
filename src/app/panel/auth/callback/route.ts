import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function getSafeRequestOrigin(request: Request) {
  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();
  const host = forwardedHost || request.headers.get("host") || "";
  const hostname = host.toLowerCase().split(":")[0];
  const isLocalHost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname);
  const isAllowedHost =
    isLocalHost ||
    hostname === "pickyalo.com" ||
    hostname === "www.pickyalo.com" ||
    hostname.endsWith(".vercel.app");

  if (host && isAllowedHost) {
    const forwardedProtocol = request.headers
      .get("x-forwarded-proto")
      ?.split(",")[0]
      ?.trim();
    const protocol = isLocalHost
      ? forwardedProtocol === "https"
        ? "https"
        : "http"
      : "https";

    return `${protocol}://${host}`;
  }

  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredSiteUrl) {
    try {
      return new URL(configuredSiteUrl).origin;
    } catch {
      // Usa el dominio público seguro si la variable está mal formada.
    }
  }

  return requestUrl.hostname === "0.0.0.0"
    ? "http://localhost:3000"
    : "https://www.pickyalo.com";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const safeOrigin = getSafeRequestOrigin(request);
  const code = requestUrl.searchParams.get("code");
  const requestedNextPath = requestUrl.searchParams.get("next") ?? "/panel";
  const nextPath =
    requestedNextPath.startsWith("/") && !requestedNextPath.startsWith("//")
      ? requestedNextPath
      : "/panel";

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/panel/login", safeOrigin));
  }

  if (code) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const loginUrl = new URL("/panel/login", safeOrigin);
      loginUrl.searchParams.set("error", "recovery");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.redirect(new URL(nextPath, safeOrigin));
}
