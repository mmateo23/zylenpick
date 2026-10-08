import type { HomeResult } from "@/components/home/home-discovery-model";
import { homeNowItems } from "@/components/home/home-discovery-model";
import { getSiteUrl } from "@/lib/seo";

function schemaType(item: HomeResult) {
  if (item.kind === "event") return "Event";
  if (item.kind === "campaign") return "CreativeWork";
  if (item.kind === "place" || item.kind === "workshop") return "TouristAttraction";
  if (item.kind === "venue") return "LocalBusiness";
  return "Product";
}

export function HomeStructuredData({
  items,
  cityName,
  today,
}: {
  items: HomeResult[];
  cityName: string;
  today: string;
}) {
  const siteUrl = new URL(getSiteUrl()).origin;
  const selected = homeNowItems(items, today);
  const pageUrl = new URL("/", siteUrl).toString();
  const value = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: `Comercio local, lugares y eventos en ${cityName}`,
        description: `Una selección de productos, comercios, lugares y eventos para descubrir ${cityName}.`,
        inLanguage: "es-ES",
        about: { "@type": "City", name: cityName },
        mainEntity: { "@id": `${pageUrl}#seleccion-local` },
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#seleccion-local`,
        name: `Ahora en ${cityName}`,
        numberOfItems: selected.length,
        itemListElement: selected.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: new URL(item.href, siteUrl).toString(),
          item: {
            "@type": schemaType(item),
            name: item.title,
            description: item.subtitle,
            image: item.image ? new URL(item.image, siteUrl).toString() : undefined,
            url: new URL(item.href, siteUrl).toString(),
            startDate: item.kind === "event" ? item.startsOn : undefined,
            endDate: item.kind === "event" ? item.endsOn : undefined,
          },
        })),
      },
    ],
  };

  return <script id="home-structured-data" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(value).replace(/</g, "\\u003c") }} />;
}
