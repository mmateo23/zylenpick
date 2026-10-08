import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, ACCESS_DURATION, createAccessTicket, getAccessPassword, safeAccessDestination } from "@/lib/site-access";

export async function POST(request: NextRequest) {
  // Next dev may normalize nextUrl to localhost while the browser uses the LAN
  // address. Host preserves the actual destination used by that browser.
  const origin = request.headers.get("origin");
  const sameOrigin = (() => {
    try {
      const url = new URL(origin || "");
      return url.host === (request.headers.get("host") || request.nextUrl.host)
        && url.protocol === request.nextUrl.protocol;
    } catch { return false; }
  })();
  if (!sameOrigin) {
    return NextResponse.json({ error: "Vuelve a abrir la pantalla de entrada." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  if (typeof body?.password !== "string" || body.password.length > 128 || body.password !== getAccessPassword()) {
    return NextResponse.json({ error: "Esa no es la clave. Prueba otra vez." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const response = NextResponse.json({ next: safeAccessDestination(body.next) }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(ACCESS_COOKIE, await createAccessTicket(), {
    httpOnly: true, secure: request.nextUrl.protocol === "https:", sameSite: "lax", path: "/", maxAge: ACCESS_DURATION,
  });
  return response;
}
