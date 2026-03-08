import { FeedMedia } from "@/features/feed/components/feed-media";
import type { FeedItem } from "@/features/feed/types";

type FoodCardProps = {
  item: FeedItem;
  isFavorite: boolean;
  isInCart: boolean;
  onToggleFavorite: () => void;
  onAddToCart: () => void;
};

export function FoodCard({
  item,
  isFavorite,
  isInCart,
  onToggleFavorite,
  onAddToCart,
}: FoodCardProps) {
  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[0_20px_50px_rgba(33,20,12,0.08)] transition hover:-translate-y-1">
      <div className="relative aspect-[4/5] overflow-hidden bg-[color:var(--surface-strong)]">
        <FeedMedia
          mediaType={item.mediaType}
          mediaUrl={item.mediaUrl}
          mediaAlt={item.mediaAlt}
          posterUrl={item.posterUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
        <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3">
          <span className="rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-[color:var(--foreground)]">
            {item.categoryLabel}
          </span>
          <button
            type="button"
            onClick={onToggleFavorite}
            className={`rounded-full px-3 py-2 text-xs font-semibold backdrop-blur-md transition ${
              isFavorite
                ? "bg-[color:var(--brand)] text-white"
                : "bg-white/14 text-white"
            }`}
          >
            {isFavorite ? "Guardado" : "Favorito"}
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <p className="text-sm font-medium text-white/78">{item.venueName}</p>
          <h3 className="mt-2 max-w-[14ch] text-3xl font-semibold leading-tight">
            {item.title}
          </h3>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-[color:var(--foreground)]">
              {item.priceLabel}
            </p>
            <p className="text-sm text-[color:var(--muted)]">
              {item.estimatedTimeLabel} · {item.venueDistance}
            </p>
          </div>
          <div className="rounded-full bg-[color:var(--surface-strong)] px-3 py-2 text-xs font-semibold text-[color:var(--foreground)]">
            {item.likesCount} me gusta
          </div>
        </div>

        <p className="text-sm leading-6 text-[color:var(--muted)]">
          {item.description}
        </p>

        <button
          type="button"
          onClick={onAddToCart}
          className={`w-full rounded-[1.1rem] px-4 py-3 text-sm font-semibold transition ${
            isInCart
              ? "bg-[color:var(--accent)] text-[color:var(--foreground)]"
              : "bg-[color:var(--foreground)] text-white"
          }`}
        >
          {isInCart ? "En carrito" : "Añadir al carrito"}
        </button>
      </div>
    </article>
  );
}
