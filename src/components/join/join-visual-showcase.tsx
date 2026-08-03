import Image from "next/image";
import Link from "next/link";

import { getPricePresentation } from "@/features/pricing/price-display";
import type { HomeShowcaseItem } from "@/features/venues/types";

type JoinVisualShowcaseProps = {
  items: HomeShowcaseItem[];
};

const showcaseSlots = [
  "sm:col-span-2 sm:row-span-2 sm:aspect-[4/3]",
  "sm:col-span-1 sm:row-span-1 sm:aspect-[4/3]",
  "sm:col-span-1 sm:row-span-1 sm:aspect-[4/3]",
  "sm:col-span-1 sm:row-span-1 sm:aspect-[4/3]",
  "sm:col-span-1 sm:row-span-1 sm:aspect-[4/3]",
];

function formatPrice(item: HomeShowcaseItem) {
  return getPricePresentation({
    priceAmount: item.priceAmount,
    currency: item.currency || "EUR",
    priceDisplayMode: item.priceDisplayMode,
    priceDisplayText: item.priceDisplayText,
    pricesVisible: item.venue.pricesVisible,
  }).label;
}

function getUniqueItems(items: HomeShowcaseItem[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (!item.imageUrl || seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

export function JoinVisualShowcase({ items }: JoinVisualShowcaseProps) {
  const selectedItems = getUniqueItems(items).slice(0, showcaseSlots.length);

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[1.8rem] border border-[#741314]/16 bg-[#FFF7E8]/86 p-4 text-[#24110E] shadow-[var(--shadow-soft)] backdrop-blur-md sm:p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#741314]">
            Así se verá
          </p>
          <h2 className="mt-3 max-w-[14ch] text-balance text-3xl font-semibold leading-[0.95] tracking-[-0.05em] text-[#24110E] sm:text-[2.45rem]">
            Tu selección clara, bonita y lista para elegir.
          </h2>
        </div>
        <span className="hidden rounded-full border border-[#741314]/16 bg-[#FDE3AD]/50 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[#741314]/72 sm:inline-flex">
          Foto clara
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3 sm:grid-rows-2">
        {selectedItems.map((item, index) => (
          <article
            key={item.id}
            className={`group relative overflow-hidden rounded-[1.4rem] border border-[#741314]/16 bg-[#FFF7E8] shadow-[0_18px_42px_rgba(116,19,20,0.10)] ${showcaseSlots[index] ? "sm:col-span-1 sm:row-span-1" : ""}`}
          >
            <div className="relative min-h-[15rem] sm:h-full sm:min-h-0">
              <Image
                src={item.imageUrl ?? ""}
                alt={item.name}
                fill
                sizes="(min-width: 1280px) 30vw, (min-width: 640px) 33vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(253,227,173,0.02),rgba(116,19,20,0.08)_56%,rgba(116,19,20,0.42)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 sm:p-4">
                <span className="rounded-full border border-[#FDE3AD]/60 bg-[#FDE3AD]/92 px-3 py-1.5 text-[0.9rem] font-bold italic text-[#741314] backdrop-blur-md">
                  {formatPrice(item)}
                </span>
                <span className="max-w-[12rem] truncate rounded-full border border-[#FDE3AD]/50 bg-[#FDE3AD]/86 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#741314] backdrop-blur-md">
                  {item.venue.name}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        <span className="rounded-full border border-[#741314]/16 bg-[#FDE3AD]/42 px-3 py-1.5 text-[11px] font-medium text-[#741314]">
          Platos visibles
        </span>
        <span className="rounded-full border border-[#741314]/16 bg-[#FDE3AD]/42 px-3 py-1.5 text-[11px] font-medium text-[#741314]">
          Nombre del local
        </span>
        <span className="rounded-full border border-[#741314]/16 bg-[#FDE3AD]/42 px-3 py-1.5 text-[11px] font-medium text-[#741314]">
          Fácil de elegir
        </span>
      </div>

      <Link
          href="/platos"
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#741314] transition hover:text-[#5F0F10]"
      >
        Ver cómo se ven los platos
        <span aria-hidden="true">↗</span>
      </Link>
    </section>
  );
}
