/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep development output isolated so `next build` cannot invalidate a
  // running dev server's CSS and manifests.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 20,
  },
  allowedDevOrigins: [
    "192.168.68.104",
    "192.168.68.105",
    "192.168.68.106",
  ],
  async headers() {
    const noIndexImageHeaders = [
      {
        key: "X-Robots-Tag",
        value: "noindex",
      },
    ];

    return [
      {
        source: "/home/assets/:path*",
        headers: noIndexImageHeaders,
      },
      {
        source: "/home/hero/:path*",
        headers: noIndexImageHeaders,
      },
      {
        source: "/home/zonas/badges/:path*",
        headers: noIndexImageHeaders,
      },
      {
        source: "/home/zonas/talavera-elements/:path*",
        headers: noIndexImageHeaders,
      },
      ...[
        "ZyelnpickLOGO_282828.svg",
        "ZyelnpickLOGO_BLANCO.svg",
        "ZyelnpickLOGO_greeb.svg",
        "ZyelnpickLOGO_green.png",
        "ZyelnpickLOGO_orange.svg",
        "ZylenPick_LOGO.png",
        "ZylenPick_LOGO.svg",
      ].map((asset) => ({
        source: `/logo/${asset}`,
        headers: noIndexImageHeaders,
      })),
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "lacomidadelosdados.es",
      },
      {
        protocol: "https",
        hostname: "cascoviejobk.es",
      },
      {
        protocol: "https",
        hostname: "www.cascoviejobk.es",
      },
      {
        protocol: "https",
        hostname: "img.zylenlabs.com",
      },
      {
        protocol: "https",
        hostname: "luvfglrodzeanwxgsxdl.supabase.co",
      },
    ],
  },
};

export default nextConfig;
