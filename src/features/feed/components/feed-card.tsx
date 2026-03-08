"use client";

import { useRef } from "react";

import { FeedMedia } from "@/features/feed/components/feed-media";
import type { FeedItem } from "@/features/feed/types";

type FeedCardProps = {
  item: FeedItem;
  isFavorite: boolean;
  isFollowingVenue: boolean;
  isVenuePrioritized: boolean;
  isInCart: boolean;
  priority?: boolean;
  onToggleFavorite: () => void;
  onToggleFollow: () => void;
  onAddToCart: () => void;
  onHide: () => void;
};

type PointerState = {
  x: number;
  y: number;
};

export function FeedCard({
  item,
  isFavorite,
  isFollowingVenue,
  isVenuePrioritized,
  isInCart,
  priority = false,
  onToggleFavorite,
  onToggleFollow,
  onAddToCart,
  onHide,
}: FeedCardProps) {
  const tapTimesRef = useRef<number[]>([]);
  const pointerStartRef = useRef<PointerState | null>(null);

  function handlePointerDown(clientX: number, clientY: number) {
    pointerStartRef.current = {
      x: clientX,
      y: clientY,
    };
  }

  function handlePointerUp(clientX: number, clientY: number) {
    const pointerStart = pointerStartRef.current;

    if (!pointerStart) {
      return;
    }

    const deltaX = clientX - pointerStart.x;
    const deltaY = clientY - pointerStart.y;
    const now = Date.now();

    // Detecta el swipe horizontal a la derecha para ocultar el item.
    if (deltaX > 110 && Math.abs(deltaY) < 80) {
      onHide();
      tapTimesRef.current = [];
      return;
    }

    tapTimesRef.current = [...tapTimesRef.current, now].filter(
      (time) => now - time < 550,
    );

    // Interpreta tres toques rápidos consecutivos como añadir al carrito.
    if (tapTimesRef.current.length >= 3) {
      onAddToCart();
      tapTimesRef.current = [];
    }
  }

  return (
    <article
      className={`overflow-hidden rounded-[1.9rem] border bg-[color:var(--surface)] transition ${
        isVenuePrioritized
          ? "border-[color:var(--brand)] shadow-[0_24px_60px_rgba(217,93,57,0.18)]"
          : "border-[color:var(--border)]"
      }`}
    >
      <div
        className="relative aspect-[4/5] overflow-hidden"
        onPointerDown={(event) =>
          handlePointerDown(event.clientX, event.clientY)
        }
        onPointerUp={(event) => handlePointerUp(event.clientX, event.clientY)}
      >
        <FeedMedia
          mediaType={item.mediaType}
          mediaUrl={item.mediaUrl}
          mediaAlt={item.mediaAlt}
          posterUrl={item.posterUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#140f0b]/90 via-[#140f0b]/10 to-transparent" />

        <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-[color:var(--foreground)]">
              {item.categoryLabel}
            </span>
            <span className="rounded-full bg-black/35 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {item.mediaType === "video" ? "Vídeo" : "Foto"}
            </span>
          </div>

          {isVenuePrioritized ? (
            <span className="rounded-full bg-[color:var(--brand)] px-3 py-1 text-xs font-semibold text-white">
              Prioridad
            </span>
          ) : null}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white/80">
                {item.venueName}
              </p>
              <p className="text-xs text-white/70">{item.venueDistance}</p>
            </div>

            <button
              type="button"
              onClick={onToggleFollow}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                isFollowingVenue
                  ? "bg-white text-[color:var(--foreground)]"
                  : "bg-white/14 text-white backdrop-blur-sm"
              }`}
            >
              {isFollowingVenue ? "Siguiendo" : "Seguir local"}
            </button>
          </div>

          <div className="space-y-3">
            <h2 className="max-w-[14ch] text-3xl font-semibold leading-tight">
              {item.title}
            </h2>
            <p className="max-w-[30ch] text-sm leading-6 text-white/82">
              {item.description}
            </p>

            <div className="flex flex-wrap gap-2 text-xs font-semibold text-white">
              <span className="rounded-full bg-white/12 px-3 py-2 backdrop-blur-sm">
                {item.priceLabel}
              </span>
              <span className="rounded-full bg-white/12 px-3 py-2 backdrop-blur-sm">
                {item.estimatedTimeLabel}
              </span>
              <span className="rounded-full bg-white/12 px-3 py-2 backdrop-blur-sm">
                {item.likesCount + (isFavorite && !item.isFavorite ? 1 : 0)} me gusta
              </span>
              {priority ? (
                <span className="rounded-full bg-[color:var(--accent)] px-3 py-2 text-[color:var(--foreground)]">
                  Ahora en tu zona
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 bg-[color:var(--surface)] p-4">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <button
            type="button"
            onClick={onToggleFavorite}
            className={`rounded-2xl px-3 py-3 font-medium transition ${
              isFavorite
                ? "bg-[color:var(--brand)] text-white"
                : "bg-[color:var(--surface-strong)] text-[color:var(--foreground)]"
            }`}
          >
            {isFavorite ? "Guardado" : "Me gusta"}
          </button>
          <button
            type="button"
            onClick={onHide}
            className="rounded-2xl bg-[color:var(--surface-strong)] px-3 py-3 font-medium text-[color:var(--foreground)]"
          >
            Ocultar
          </button>
          <button
            type="button"
            onClick={onAddToCart}
            className={`rounded-2xl px-3 py-3 font-medium ${
              isInCart
                ? "bg-[color:var(--accent)] text-[color:var(--foreground)]"
                : "bg-[color:var(--foreground)] text-white"
            }`}
          >
            {isInCart ? "En carrito" : "Añadir"}
          </button>
        </div>

        <div className="rounded-[1.35rem] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-[color:var(--muted)]">
          <span className="font-semibold text-[color:var(--foreground)]">
            Gesto rápido:
          </span>{" "}
          triple toque sobre la foto o el vídeo para añadir. Desliza a la derecha
          para ocultar este plato.
        </div>
      </div>
    </article>
  );
}
