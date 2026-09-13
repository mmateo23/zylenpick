import type { HomeShowcaseItem } from "@/features/venues/types";

export type CurationFilter =
  | "all"
  | "worldCup"
  | "finallyFriday"
  | "raciones"
  | "daniHome"
  | "tapas"
  | "quienNoApolla"
  | "mojarPan"
  | "bocatas"
  | "veggano"
  | "recommended"
  | "city"
  | "surprise"
  | "premium"
  | "hot"
  | "cityStars";

export const curationOptions = [
                    { id: "all", label: "Todo" },
                    { id: "worldCup", label: "\uD83C\uDFC6\u26BD #EspecialMundial26" },
                    { id: "finallyFriday", label: "\uD83C\uDF89 #PorFinViernes" },
                    { id: "raciones", label: "\uD83C\uDF7B #RacionesConLosColegas" },
                    { id: "daniHome", label: "\uD83C\uDFE0 #EnCasaDeDani" },
                    { id: "tapas", label: "\uD83C\uDF62 #EspecialTapas" },
                    { id: "quienNoApolla", label: "\uD83D\uDC14 #QuienNoApolla" },
                    { id: "mojarPan", label: "\uD83E\uDD56 #ParaMojarPan" },
                    { id: "bocatas", label: "\uD83E\uDD6A #Bocatas" },
                    { id: "veggano", label: "\uD83C\uDF31 #VegganoHermano" },
                    { id: "recommended", label: "\u2B50 #Recomendados" },
                    { id: "premium", label: "\uD83D\uDC51 #MuyTOP" },
                    { id: "hot", label: "\uD83D\uDD25 #NoTeLoPierdas" },
                    { id: "cityStars", label: "Top de tu zona" },
                    { id: "city", label: "Lo mejor de tu zona" },
                    { id: "surprise", label: "\uD83C\uDFB2 Sorpr\u00E9ndete" },
                  ] as const satisfies readonly { id: CurationFilter; label: string }[];

export function getStableHash(value: string) {
  return Array.from(value).reduce((accumulator, character) => {
    return (accumulator * 31 + character.charCodeAt(0)) >>> 0;
  }, 7);
}

function getItemSearchBlob(item: HomeShowcaseItem) {
  return [
    item.name,
    item.description ?? "",
    item.categoryName ?? "",
    item.venue.name,
    item.venue.cityName,
  ]
    .join(" ")
    .toLocaleLowerCase("es");
}

export function getFilteredItems(
  items: HomeShowcaseItem[],
  curationFilter: CurationFilter,
  categoryFilter: string,
  primaryCitySlug: string | null,
  searchQuery: string,
) {
  const matchesAny = (item: HomeShowcaseItem, needles: string[]) => {
    const blob = getItemSearchBlob(item);
    return needles.some((needle) => blob.includes(needle));
  };

  const curatedItems =
    curationFilter === "worldCup"
      ? [...items]
          .filter(
            (item) =>
              item.venue.subscriptionActive ||
              item.isFeatured ||
              item.isHomeFeatured ||
              item.isPickupMonthHighlight,
          )
          .sort((left, right) => {
            const leftScore =
              (left.venue.subscriptionActive ? 4 : 0) +
              (left.isFeatured || left.isHomeFeatured ? 2 : 0) +
              (left.isPickupMonthHighlight ? 1 : 0);
            const rightScore =
              (right.venue.subscriptionActive ? 4 : 0) +
              (right.isFeatured || right.isHomeFeatured ? 2 : 0) +
              (right.isPickupMonthHighlight ? 1 : 0);

            return rightScore - leftScore;
          })
      : curationFilter === "finallyFriday"
        ? items.filter(
            (item) =>
              item.venue.subscriptionActive ||
              item.isFeatured ||
              item.isHomeFeatured ||
              matchesAny(item, [
                "burger",
                "pizza",
                "nachos",
                "bocata",
                "croqueta",
                "tapa",
                "raci\u00f3n",
                "cerveza",
              ]),
          )
      : curationFilter === "raciones"
        ? items.filter((item) =>
            matchesAny(item, [
              "raci\u00f3n",
              "racion",
              "para compartir",
              "croqueta",
              "croquetas",
              "nachos",
              "alitas",
              "patatas",
              "tapa",
              "tapas",
            ]),
          )
      : curationFilter === "daniHome"
        ? items.filter((item) =>
            matchesAny(item, [
              "casero",
              "casera",
              "casa",
              "tradicional",
              "de la abuela",
              "guiso",
              "cuchara",
            ]),
          )
      : curationFilter === "tapas"
        ? items.filter((item) =>
            matchesAny(item, [
              "tapa",
              "tapas",
              "pincho",
              "pinchos",
              "montadito",
              "montaditos",
              "croqueta",
              "croquetas",
            ]),
          )
      : curationFilter === "quienNoApolla"
        ? items.filter((item) =>
            matchesAny(item, [
              "pollo",
              "alitas",
              "crispy",
              "finger",
              "nugget",
              "kebab",
            ]),
          )
      : curationFilter === "mojarPan"
        ? items.filter((item) =>
            matchesAny(item, [
              "salsa",
              "guiso",
              "huevo",
              "tomate",
              "caldo",
              "crema",
              "queso",
              "boletus",
            ]),
          )
      : curationFilter === "bocatas"
        ? items.filter((item) =>
            matchesAny(item, [
              "bocata",
              "bocadillo",
              "s\u00e1ndwich",
              "mollete",
              "panini",
            ]),
          )
      : curationFilter === "veggano"
        ? items.filter((item) =>
            matchesAny(item, [
              "vegano",
              "vegana",
              "veggie",
              "vegetal",
              "falafel",
              "tofu",
              "ensalada",
            ]),
          )
      : curationFilter === "recommended"
      ? items.filter(
          (item) =>
            item.isFeatured ||
            item.isHomeFeatured ||
            item.isPickupMonthHighlight,
        )
      : curationFilter === "premium"
        ? items.filter(
            (item) =>
              item.venue.subscriptionActive &&
              (item.isFeatured ||
                item.isHomeFeatured ||
                item.isPickupMonthHighlight),
          )
        : curationFilter === "hot"
          ? items.filter(
              (item) => item.isPickupMonthHighlight || item.isHomeFeatured,
            )
      : curationFilter === "city" && primaryCitySlug
        ? items.filter((item) => item.venue.citySlug === primaryCitySlug)
        : curationFilter === "cityStars" && primaryCitySlug
          ? items.filter(
              (item) =>
                item.venue.citySlug === primaryCitySlug &&
                (item.venue.subscriptionActive ||
                  item.isFeatured ||
                  item.isHomeFeatured),
            )
        : curationFilter === "surprise"
          ? [...items].sort(
              (left, right) => getStableHash(left.id) - getStableHash(right.id),
            )
          : items;

  if (categoryFilter === "all") {
    if (!searchQuery.trim()) {
      return curatedItems;
    }

    const normalizedQuery = searchQuery.trim().toLocaleLowerCase("es");

    return curatedItems.filter((item) =>
      [
        item.name,
        item.categoryName ?? "",
        item.venue.name,
        item.venue.cityName,
      ].some((value) => value.toLocaleLowerCase("es").includes(normalizedQuery)),
    );
  }

  const categoryItems = curatedItems.filter(
    (item) => item.categoryName === categoryFilter,
  );

  if (!searchQuery.trim()) {
    return categoryItems;
  }

  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("es");

  return categoryItems.filter((item) =>
    [item.name, item.categoryName ?? "", item.venue.name, item.venue.cityName]
      .some((value) => value.toLocaleLowerCase("es").includes(normalizedQuery)),
  );
}
