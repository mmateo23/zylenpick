import { getSiteUrl } from "@/lib/seo";

const escapeJsonForHtml = (value: unknown) =>
  JSON.stringify(value).replace(/</g, "\\u003c");

export function PickyaloStructuredData() {
  const siteUrl = new URL(getSiteUrl()).origin;
  const organizationId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;
  const logoUrl = new URL("/icons/pickyalo-icon-512.png", siteUrl).toString();

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: "Pickyalo",
        url: siteUrl,
        description:
          "Plataforma visual para descubrir productos y platos de locales cercanos y recogerlos en el establecimiento.",
        logo: {
          "@type": "ImageObject",
          url: logoUrl,
          contentUrl: logoUrl,
          width: 512,
          height: 512,
          caption: "Pickyalo",
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: siteUrl,
        name: "Pickyalo",
        description:
          "Descubre productos y platos destacados de locales cercanos para recoger.",
        inLanguage: "es-ES",
        publisher: {
          "@id": organizationId,
        },
      },
    ],
  };

  return (
    <script
      id="pickyalo-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: escapeJsonForHtml(structuredData) }}
    />
  );
}
