import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { ACCESS_COOKIE, ACCESS_DURATION, createAccessTicket, hasSiteAccess, safeAccessDestination } from "../src/lib/site-access";
import { middleware } from "../src/middleware";
import { POST } from "../src/app/api/site-access/route";

describe("shared invitation gate", () => {
  it("rejects missing, forged and expired tickets", async () => {
    const now = Date.now();
    const ticket = await createAccessTicket(now);
    expect(await hasSiteAccess(ticket, now)).toBe(true);
    expect(await hasSiteAccess(undefined)).toBe(false);
    expect(await hasSiteAccess(`${ticket.slice(0, -1)}${ticket.endsWith("0") ? "1" : "0"}`, now)).toBe(false);
    expect(await hasSiteAccess(ticket, now + (ACCESS_DURATION + 1) * 1000)).toBe(false);
  });
  it("blocks direct pages and data without a valid invitation", async () => {
    for (const path of ["/", "/platos", "/mapa", "/panel", "/manage/private", "/urbanos-talavera.json"]) {
      const response = await middleware(new NextRequest(`http://localhost:3000${path}`));
      expect(response.status).toBe(307);
      expect(new URL(response.headers.get("location")!).pathname).toBe("/entrada");
    }
    expect((await middleware(new NextRequest("http://localhost:3000/api/transit/route"))).status).toBe(401);
  });
  it("allows entry and resumes the original destination after unlocking", async () => {
    expect((await middleware(new NextRequest("http://localhost:3000/entrada"))).status).toBe(200);
    const ticket = await createAccessTicket();
    const response = await middleware(new NextRequest("http://localhost:3000/platos", { headers: { cookie: `${ACCESS_COOKIE}=${ticket}` } }));
    expect(response.status).toBe(200);
  });
  it("only accepts the password from the same origin and issues an HttpOnly cookie", async () => {
    const request = (password: string, origin = "http://localhost:3000") => new NextRequest("http://localhost:3000/api/site-access", {
      method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify({ password, next: "/mapa?explora=1" }),
    });
    expect((await POST(request("wrong"))).status).toBe(401);
    expect((await POST(request("PickyaTala", "https://other.example"))).status).toBe(403);
    const response = await POST(request("PickyaTala"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ next: "/mapa?explora=1" });
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(await hasSiteAccess(response.cookies.get(ACCESS_COOKIE)?.value)).toBe(true);
    const lanRequest = new NextRequest("http://localhost:3000/api/site-access", {
      method: "POST", headers: { host: "192.168.68.103:3000", origin: "http://192.168.68.103:3000", "content-type": "application/json" },
      body: JSON.stringify({ password: "PickyaTala" }),
    });
    expect((await POST(lanRequest)).status).toBe(200);
  });
  it("never redirects to external URLs", () => {
    for (const url of ["https://other.example", "//other.example", "/\\other.example", "/entrada", "/api/join"]) expect(safeAccessDestination(url)).toBe("/");
    expect(safeAccessDestination("/platos?modo=locales")).toBe("/platos?modo=locales");
  });
});
