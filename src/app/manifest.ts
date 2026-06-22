import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pickyalo",
    short_name: "Pickyalo",
    description:
      "Productos y platos destacados de locales cercanos para recoger.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FFE9EC",
    theme_color: "#381932",
    icons: [
      {
        src: "/icons/pickyalo-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/pickyalo-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/pickyalo-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/pickyalo-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
