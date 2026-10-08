import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";

vi.mock("next/image", () => ({ default: ({ src, alt }: { src: string; alt: string }) => createElement("img", { src, alt }) }));
vi.mock("next/link", () => ({ default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => createElement("a", { href, "aria-label": (props as Record<string,string>)["aria-label"] }, children) }));
vi.mock("@/components/layout/site-header", () => ({ SiteHeader: () => null }));
vi.mock("@/components/layout/zylenpick-footer", () => ({ ZylenPickFooter: () => null }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }) }));

import { PickyaloHome } from "@/components/home/pickyalo-home";
import {
  changeHomeSelection,
  homeNowItems,
  homeResults,
  type HomeResult,
} from "@/components/home/home-discovery-model";
import { GET, POST } from "@/app/api/cart/route";
import nextConfig from "../next.config.mjs";

describe("Home discovery", () => {
  it("keeps all three entrances and real navigation with an empty catalogue", () => {
    const html = renderToStaticMarkup(<PickyaloHome cities={[]} citySlug="" cityName="Tu localidad" items={[]}
      today="2026-09-20" mapboxAccessToken="" entryImages={{
        commerce: "/home/assets/asset_bocadillo_calamares_transparent.png",
        discover: "/home/drive/place-02.png",
        events: "/qr/ceramica-junto-al-tajo-relieve.png",
      }} />);
    for (const text of ["Comercios", "Descubre", "Eventos"]) expect(html).toContain(text);
    expect(html).toContain('href="/platos?modo=locales"');
    expect(html).toContain('href="/mapa?explora=1"');
    expect(html).toContain('href="/eventos"');
    expect(html).toContain('href="/el-proyecto"');
    expect(html).not.toMatch(/href="\/(cart|checkout|pedidos)/);
  });
  it("keeps the Home preview short and mixed", () => {
    const items: HomeResult[] = [
      { id: "food-1", path: "comer", kind: "product", title: "Pizza", subtitle: "Local", category: "pizza", categoryLabel: "Pizza", image: null, href: "/local/1", cta: "Ver" },
      { id: "food-2", path: "comer", kind: "product", title: "Miel", subtitle: "Tienda", category: "miel", categoryLabel: "Miel", image: null, href: "/local/2", cta: "Ver" },
      { id: "place", path: "descubrir", kind: "place", title: "Mural", subtitle: "Talavera", category: "mural", categoryLabel: "Mural", image: null, href: "/mapa", cta: "Ver" },
      { id: "event", path: "eventos", kind: "event", title: "Feria", subtitle: "Centro", category: "", categoryLabel: "", image: null, href: "/evento", cta: "Ver", startsOn: "2026-09-21" },
    ];
    expect(homeNowItems(items, "2026-09-20").map((item) => item.id)).toEqual(["food-1", "place", "food-2", "event"]);
  });
  it("clears only a category that becomes incompatible with a new path", () => {
    const items: HomeResult[] = [
      { id: "food", path: "comer", kind: "product", title: "Pizza", subtitle: "Local", category: "pizza", categoryLabel: "Pizza", image: null, href: "/local", cta: "Ver" },
      { id: "place", path: "descubrir", kind: "place", title: "Mural", subtitle: "Talavera", category: "mural", categoryLabel: "Mural", image: null, href: "/mapa", cta: "Ver" },
    ];
    expect(changeHomeSelection(items, { path: "comer", category: "pizza", period: "proximos" }, { path: "descubrir" }, "2026-09-20"))
      .toEqual({ path: "descubrir", category: "", period: "proximos" });
  });
  it("never treats a past dated event as upcoming, while keeping the editorial campaign separate", () => {
    const items: HomeResult[] = [
      { id: "past", path: "eventos", kind: "event", title: "Pasado", subtitle: "", category: "", categoryLabel: "", image: null, href: "/", cta: "Ver", startsOn: "2026-09-01", endsOn: "2026-09-02" },
      { id: "next", path: "eventos", kind: "event", title: "Próximo", subtitle: "", category: "", categoryLabel: "", image: null, href: "/", cta: "Ver", startsOn: "2026-09-21" },
      { id: "campaign", path: "eventos", kind: "campaign", title: "Edición", subtitle: "", category: "", categoryLabel: "", image: null, href: "/", cta: "Ver" },
    ];
    expect(homeResults(items, { path: "eventos", category: "", period: "proximos" }, "2026-09-20").map((item) => item.id))
      .toEqual(["next", "campaign"]);
  });
});

describe("ordering frozen at the public boundary", () => {
  it("redirects every legacy order route temporarily", async () => {
    const redirects = await nextConfig.redirects!();
    for (const path of ["cart", "carrito", "checkout", "pedidos"]) {
      expect(redirects).toContainEqual({ source: `/${path}/:path*`, destination: "/", permanent: false });
    }
  });
  it("disables reads and writes to the persisted cart API", async () => {
    for (const handler of [GET, POST]) {
      const response = handler();
      expect(response.status).toBe(410);
      expect(response.headers.get("Cache-Control")).toBe("no-store");
      expect(await response.json()).toHaveProperty("error");
    }
  });
});
