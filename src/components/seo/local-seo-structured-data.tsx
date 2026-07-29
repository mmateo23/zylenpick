import {
  openingHourDayOrder,
  type OpeningHoursDayKey,
  type OpeningHoursValue,
} from "@/features/venues/opening-hours";
import type {
  VenueDetails,
  VenueListItem,
  VenueMenuItem,
} from "@/features/venues/types";
import { getSiteUrl } from "@/lib/seo";

const dayOfWeekByKey: Record<OpeningHoursDayKey, string> = {
  mon: "https://schema.org/Monday",
  tue: "https://schema.org/Tuesday",
  wed: "https://schema.org/Wednesday",
  thu: "https://schema.org/Thursday",
  fri: "https://schema.org/Friday",
  sat: "https://schema.org/Saturday",
  sun: "https://schema.org/Sunday",
};

function escapeJsonForHtml(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function absoluteUrl(value: string | null | undefined, siteUrl: string) {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value, siteUrl).toString();
  } catch {
    return undefined;
  }
}

function openingHoursSpecifications(openingHours: OpeningHoursValue) {
  return openingHourDayOrder.flatMap((dayKey) => {
    const day = openingHours[dayKey];

    if (!day.isOpen) {
      return [];
    }

    return [
      [day.firstOpen, day.firstClose],
      [day.secondOpen, day.secondClose],
    ].flatMap(([opens, closes]) =>
      opens && closes
        ? [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: dayOfWeekByKey[dayKey],
              opens,
              closes,
            },
          ]
        : [],
    );
  });
}

function buildMenuSections(
  items: VenueMenuItem[],
  venueUrl: string,
  pricesVisible: boolean,
) {
  const sections = new Map<string, VenueMenuItem[]>();

  for (const item of items) {
    const sectionName = item.categoryName ?? "Productos y platos";
    sections.set(sectionName, [...(sections.get(sectionName) ?? []), item]);
  }

  return Array.from(sections.entries()).map(([name, sectionItems]) => ({
    "@type": "MenuSection",
    name,
    hasMenuItem: sectionItems.map((item) => ({
      "@type": "MenuItem",
      "@id": `${venueUrl}#plato-${item.id}`,
      name: item.name,
      description: item.description ?? undefined,
      image: absoluteUrl(item.imageUrl, venueUrl),
      offers: pricesVisible
        ? {
            "@type": "Offer",
            price: item.priceAmount.toFixed(2),
            priceCurrency: item.currency,
            availability: "https://schema.org/InStock",
            url: `${venueUrl}#plato-${item.id}`,
          }
        : undefined,
    })),
  }));
}

function StructuredDataScript({
  id,
  value,
}: {
  id: string;
  value: unknown;
}) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: escapeJsonForHtml(value) }}
    />
  );
}

export function CityLocalStructuredData({
  city,
  venues,
}: {
  city: {
    slug: string;
    name: string;
    region: string | null;
    heroImageUrl: string | null;
  };
  venues: VenueListItem[];
}) {
  const siteUrl = new URL(getSiteUrl()).origin;
  const cityUrl = new URL(`/zonas/${city.slug}`, siteUrl).toString();
  const itemListId = `${cityUrl}#locales`;

  const value = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${cityUrl}#webpage`,
        url: cityUrl,
        name: `Comida para recoger en ${city.name}`,
        description: `Descubre comida local, productos y platos destacados de locales cercanos en ${city.name}.`,
        inLanguage: "es-ES",
        image: absoluteUrl(city.heroImageUrl, siteUrl),
        about: {
          "@type": "City",
          name: city.name,
          containedInPlace: city.region
            ? {
                "@type": "AdministrativeArea",
                name: city.region,
              }
            : undefined,
        },
        mainEntity: {
          "@id": itemListId,
        },
      },
      {
        "@type": "ItemList",
        "@id": itemListId,
        name: `Locales con comida para recoger en ${city.name}`,
        numberOfItems: venues.length,
        itemListElement: venues.map((venue, index) => {
          const venueUrl = new URL(
            `/zonas/${city.slug}/venues/${venue.slug}`,
            siteUrl,
          ).toString();

          return {
            "@type": "ListItem",
            position: index + 1,
            url: venueUrl,
            item: {
              "@type": "FoodEstablishment",
              "@id": `${venueUrl}#local`,
              name: venue.name,
              url: venueUrl,
              description: venue.description ?? undefined,
              image: absoluteUrl(venue.coverUrl, siteUrl),
              address: venue.address
                ? {
                    "@type": "PostalAddress",
                    streetAddress: venue.address,
                    addressLocality: city.name,
                    addressRegion: city.region ?? undefined,
                    addressCountry: "ES",
                  }
                : undefined,
              geo:
                venue.latitude !== null && venue.longitude !== null
                  ? {
                      "@type": "GeoCoordinates",
                      latitude: venue.latitude,
                      longitude: venue.longitude,
                    }
                  : undefined,
            },
          };
        }),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${cityUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Pickyalo",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Zonas",
            item: new URL("/zonas", siteUrl).toString(),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: city.name,
            item: cityUrl,
          },
        ],
      },
    ],
  };

  return <StructuredDataScript id="city-local-structured-data" value={value} />;
}

export function VenueLocalStructuredData({
  venue,
}: {
  venue: VenueDetails;
}) {
  const siteUrl = new URL(getSiteUrl()).origin;
  const cityUrl = new URL(`/zonas/${venue.city.slug}`, siteUrl).toString();
  const venueUrl = new URL(
    `/zonas/${venue.city.slug}/venues/${venue.slug}`,
    siteUrl,
  ).toString();
  const menuId = `${venueUrl}#seleccion`;
  const openingHours = openingHoursSpecifications(venue.openingHours);

  const value = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${venueUrl}#webpage`,
        url: venueUrl,
        name: `${venue.name} en ${venue.city.name}`,
        description:
          venue.description ??
          `Consulta la selección visual de ${venue.name} y recoge en ${venue.city.name}.`,
        inLanguage: "es-ES",
        mainEntity: {
          "@id": `${venueUrl}#local`,
        },
        breadcrumb: {
          "@id": `${venueUrl}#breadcrumb`,
        },
      },
      {
        "@type": "FoodEstablishment",
        "@id": `${venueUrl}#local`,
        name: venue.name,
        url: venueUrl,
        description: venue.description ?? undefined,
        image: absoluteUrl(venue.coverUrl, siteUrl),
        logo: absoluteUrl(venue.logoUrl, siteUrl),
        telephone: venue.phone ?? undefined,
        sameAs: venue.website ? [venue.website] : undefined,
        address: venue.address
          ? {
              "@type": "PostalAddress",
              streetAddress: venue.address,
              addressLocality: venue.city.name,
              addressCountry: "ES",
            }
          : undefined,
        geo:
          venue.latitude !== null && venue.longitude !== null
            ? {
                "@type": "GeoCoordinates",
                latitude: venue.latitude,
                longitude: venue.longitude,
              }
            : undefined,
        openingHoursSpecification:
          openingHours.length > 0 ? openingHours : undefined,
        hasMenu: {
          "@id": menuId,
        },
      },
      {
        "@type": "Menu",
        "@id": menuId,
        name: `Selección visual de ${venue.name}`,
        url: venueUrl,
        hasMenuSection: buildMenuSections(
          venue.menuItems,
          venueUrl,
          venue.pricesVisible,
        ),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${venueUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Pickyalo",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Zonas",
            item: new URL("/zonas", siteUrl).toString(),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: venue.city.name,
            item: cityUrl,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: venue.name,
            item: venueUrl,
          },
        ],
      },
    ],
  };

  return (
    <StructuredDataScript id="venue-local-structured-data" value={value} />
  );
}
