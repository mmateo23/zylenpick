import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/platos", "/zonas", "/zonas/"],
        disallow: [
          "/acceder",
          "/cuenta",
          "/favoritos",
          "/pedidos",
          "/carrito",
          "/cart",
          "/checkout/",
          "/panel",
          "/panel/",
          "/panel-comercio",
          "/api/",
          "/demo/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
