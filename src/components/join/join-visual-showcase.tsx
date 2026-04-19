import Image from "next/image";
import Link from "next/link";

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
  const normalizedAmount =
    Number.isInteger(item.priceAmount) && item.priceAmount >= 100
      ? item.priceAmount / 100
      : item.priceAmount;

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: item.currency || "EUR",
    minimumFractionDigits: 2,
  }).format(normalizedAmount);
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
    <section className="rounded-[1.8rem] border border-[color:var(--border)] bg-[color:var(--surface)]/52 p-4 shadow-[var(--soft-shadow)] backdrop-blur-md sm:p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[color:var(--brand)]">
            Así se verá
          </p>
          <h2 className="mt-3 max-w-[14ch] text-balance text-3xl font-semibold leading-[0.95] tracking-[-0.05em] text-[color:var(--foreground)] sm:text-[2.45rem]">
            Tus platos claros, bonitos y listos para elegir.
          </h2>
        </div>
        <span className="hidden rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)]/76 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[color:var(--muted)] sm:inline-flex">
          Foto clara
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3 sm:grid-rows-2">
        {selectedItems.map((item, index) => (
          <article
            key={item.id}
            className={`group relative overflow-hidden rounded-[1.4rem] border border-white/8 bg-[#0c1312] ${showcaseSlots[index] ?? "sm:col-span-1 sm:row-span-1"}`}
          >
            <div className="relative min-h-[15rem] sm:h-full sm:min-h-0">
              <Image
                src={item.imageUrl ?? ""}
                alt={item.name}
                fill
                sizes="(min-width: 1280px) 30vw, (min-width: 640px) 33vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,10,0.02),rgba(7,10,10,0.1)_56%,rgba(7,10,10,0.46)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 sm:p-4">
                <span className="rounded-full border border-white/10 bg-black/24 px-3 py-1.5 text-[0.9rem] font-bold italic text-[#7cffb8] backdrop-blur-md">
                  {formatPrice(item)}
                </span>
                <span className="max-w-[12rem] truncate rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white/70 backdrop-blur-md">
                  {item.venue.name}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)]/76 px-3 py-1.5 text-[11px] font-medium text-[color:var(--muted-strong)]">
          Platos visibles
        </span>
        <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)]/76 px-3 py-1.5 text-[11px] font-medium text-[color:var(--muted-strong)]">
          Nombre del local
        </span>
        <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)]/76 px-3 py-1.5 text-[11px] font-medium text-[color:var(--muted-strong)]">
          Fácil de elegir
        </span>
      </div>

      <Link
          href="/platos"
        className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--foreground)] transition hover:text-[color:var(--brand)]"
      >
        Ver cómo se ven los platos
        <span aria-hidden="true">↗</span>
      </Link>
    </section>
  );
}
