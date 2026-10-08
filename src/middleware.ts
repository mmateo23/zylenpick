import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";
import { ACCESS_COOKIE, hasSiteAccess, isSiteGateEnabled } from "@/lib/site-access";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (isSiteGateEnabled() && path !== "/entrada" && path !== "/api/site-access"
    && !(await hasSiteAccess(request.cookies.get(ACCESS_COOKIE)?.value))) {
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "Introduce la clave para entrar." }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
    }
    const destination = request.nextUrl.clone();
    destination.pathname = "/entrada";
    destination.search = "";
    if (path !== "/") destination.searchParams.set("next", path + request.nextUrl.search);
    const response = NextResponse.redirect(destination);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }
  if (path.startsWith("/cuenta") || path.startsWith("/panel-comercio")) return updateSession(request);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|sw\\.js$|manifest\\.webmanifest$|favicon\\.ico$|(?:cart|events|hero|home|icons|images|join|logo|manage|mock-media|qr|zones)/.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico|woff|woff2|mp4|webm|mov)$).*)"],
};
