import type { Metadata } from "next";

const defaultSiteUrl = "https://zylenpick.com";

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? defaultSiteUrl;
}

export function getBaseMetadata({
  title,
  description,
  path = "/",
  image = "/logo/ZylenPick_LOGO.png?v=1",
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
}): Metadata {
  const siteUrl = getSiteUrl();
  const canonicalUrl = new URL(path, siteUrl).toString();
  const imageUrl = new URL(image, siteUrl).toString();

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "ZylenPick",
      locale: "es_ES",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function getNoIndexMetadata({
  title,
  description,
}: {
  title: string;
  description: string;
}): Metadata {
  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
  };
}
