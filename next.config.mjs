/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.68.105"],
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
