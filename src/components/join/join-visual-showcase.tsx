import Image from "next/image";
import Link from "next/link";

import type { HomeShowcaseItem } from "@/features/venues/types";

type JoinVisualShowcaseProps = {
  items: HomeShowcaseItem[];
};

const showcaseSlots = [
  "sm:col-span-2 sm:row-span-2",
  "sm:col-span-1 sm:row-span-1",
  "sm:col-span-1 sm:row-span-1",
  "sm:col-span-1 sm:row-span-1",
  "sm:col-span-1 sm:row-span-1",
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
            Selección visual
          </p>
          <h2 className="mt-3 max-w-[14ch] text-balance text-3xl font-semibold leading-[0.95] tracking-[-0.05em] text-[color:var(--foreground)] sm:text-[2.45rem]">
            Así se verían tus platos dentro de ZylenPick.
          </h2>
        </div>
        <span className="hidden rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)]/76 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[color:var(--muted)] sm:inline-flex">
          Foto primero
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3 sm:grid-rows-2">
        {selectedItems.map((item, index) => (
          <article
            key={item.id}
            className={`group relative overflow-hidden rounded-[1.4rem] border border-white/8 bg-[#0c1312] ${showcaseSlots[index] ?? "sm:col-span-1 sm:row-span-1"}`}
          >
            <div className="relative min-h-[15rem] sm:min-h-full">
              <Image
                src={item.imageUrl ?? ""}
                alt={item.name}
                fill
                sizes="(min-width: 1280px) 30vw, (min-width: 640px) 33vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,10,0.04),rgba(7,10,10,0.18)_44%,rgba(7,10,10,0.76)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <div className="rounded-[1.15rem] border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-md">
                  <p className="line-clamp-2 text-[1rem] font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-[1.1rem]">
                    {item.name}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-[0.96rem] font-bold italic text-[#7cffb8]">
                      {formatPrice(item)}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-white/68">
                      {item.venue.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)]/76 px-3 py-1.5 text-[11px] font-medium text-[color:var(--muted-strong)]">
          Imagen protagonista
        </span>
        <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)]/76 px-3 py-1.5 text-[11px] font-medium text-[color:var(--muted-strong)]">
          Local visible
        </span>
        <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)]/76 px-3 py-1.5 text-[11px] font-medium text-[color:var(--muted-strong)]">
          Carta más limpia
        </span>
      </div>

      <Link
          href="/platos"
        className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--foreground)] transition hover:text-[color:var(--brand)]"
      >
        Ver la demo de platos
        <span aria-hidden="true">↗</span>
      </Link>
    </section>
  );
}
