/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.68.104", "192.168.68.105"],
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
    ],
  },
};

export default nextConfig;
