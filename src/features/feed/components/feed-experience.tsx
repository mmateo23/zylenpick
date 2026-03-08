"use client";

import { useEffect, useMemo, useState } from "react";

import type { PersistedCart } from "@/features/cart/types";
import {
  fetchPersistedCart,
  getCartSessionId,
  getFallbackCart,
  persistCartItem,
} from "@/features/cart/services/cart-api";
import { HomeHeader } from "@/features/feed/components/home-header";
import { HomeHero } from "@/features/feed/components/home-hero";
import { FoodCard } from "@/features/feed/components/food-card";
import { SectionHeading } from "@/features/feed/components/section-heading";
import { VenueCard } from "@/features/feed/components/venue-card";
import { FEED_SESSION_STORAGE_KEY } from "@/features/feed/constants";
import type { FeedItem } from "@/features/feed/types";

type FeedExperienceProps = {
  items: FeedItem[];
};

type FeedUiSessionState = {
  favoriteIds: string[];
  hiddenIds: string[];
  followedVenueIds: string[];
};

type ToastState = {
  id: number;
  message: string;
};

type VenueSummary = {
  venueId: string;
  venueName: string;
  venueDistance: string;
  dishesCount: number;
};

const defaultUiSessionState: FeedUiSessionState = {
  favoriteIds: [],
  hiddenIds: [],
  followedVenueIds: [],
};

const locationOptions = ["Madrid centro", "Salamanca", "Chamberi", "Malasana"];

export function FeedExperience({ items }: FeedExperienceProps) {
  const [uiSessionState, setUiSessionState] =
    useState<FeedUiSessionState>(defaultUiSessionState);
  const [cartState, setCartState] = useState<PersistedCart>(getFallbackCart());
  const [cartSessionId, setCartSessionId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [activeLocation, setActiveLocation] = useState(locationOptions[0]);

  useEffect(() => {
    const savedState = window.sessionStorage.getItem(FEED_SESSION_STORAGE_KEY);

    if (!savedState) {
      setUiSessionState({
        favoriteIds: items.filter((item) => item.isFavorite).map((item) => item.id),
        hiddenIds: [],
        followedVenueIds: items
          .filter((item) => item.isFollowingVenue)
          .map((item) => item.venueId),
      });
      setIsReady(true);
      return;
    }

    try {
      const parsedState = JSON.parse(savedState) as FeedUiSessionState;
      setUiSessionState(parsedState);
    } catch {
      setUiSessionState(defaultUiSessionState);
    } finally {
      setIsReady(true);
    }
  }, [items]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.sessionStorage.setItem(
      FEED_SESSION_STORAGE_KEY,
      JSON.stringify(uiSessionState),
    );
  }, [isReady, uiSessionState]);

  useEffect(() => {
    const sessionId = getCartSessionId();
    setCartSessionId(sessionId);

    void fetchPersistedCart(sessionId).then((cart) => {
      if (cart) {
        setCartState(cart);
      }
    });
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const visibleItems = useMemo(
    () => items.filter((item) => !uiSessionState.hiddenIds.includes(item.id)),
    [items, uiSessionState.hiddenIds],
  );

  const orderedItems = useMemo(() => {
    if (!cartState.venueId) {
      return visibleItems;
    }

    const matchingVenueItems = visibleItems.filter(
      (item) => item.venueId === cartState.venueId,
    );
    const otherItems = visibleItems.filter(
      (item) => item.venueId !== cartState.venueId,
    );

    return [...matchingVenueItems, ...otherItems];
  }, [cartState.venueId, visibleItems]);

  const categoryItems = useMemo(
    () =>
      Array.from(new Set(orderedItems.map((item) => item.categoryLabel))).slice(0, 8),
    [orderedItems],
  );

  const nearbyItems = orderedItems.slice(0, 4);
  const mostOrderedItems = [...orderedItems]
    .sort((left, right) => right.likesCount - left.likesCount)
    .slice(0, 4);
  const followedItems = orderedItems
    .filter((item) => uiSessionState.followedVenueIds.includes(item.venueId))
    .slice(0, 4);

  const venueSummaries = useMemo(() => {
    const groupedVenues = new Map<string, VenueSummary>();

    orderedItems.forEach((item) => {
      const currentVenue = groupedVenues.get(item.venueId);

      if (currentVenue) {
        currentVenue.dishesCount += 1;
        return;
      }

      groupedVenues.set(item.venueId, {
        venueId: item.venueId,
        venueName: item.venueName,
        venueDistance: item.venueDistance,
        dishesCount: 1,
      });
    });

    return Array.from(groupedVenues.values());
  }, [orderedItems]);

  const followedVenueSummaries = venueSummaries.filter((venue) =>
    uiSessionState.followedVenueIds.includes(venue.venueId),
  );

  const cartVenueName = cartState.venueName ?? "Sin seleccion";

  function showToast(message: string) {
    setToast({
      id: Date.now(),
      message,
    });
  }

  function toggleFavorite(itemId: string) {
    setUiSessionState((currentState) => {
      const alreadySaved = currentState.favoriteIds.includes(itemId);
      const favoriteIds = alreadySaved
        ? currentState.favoriteIds.filter((id) => id !== itemId)
        : [...currentState.favoriteIds, itemId];

      showToast(alreadySaved ? "Eliminado de favoritos" : "Guardado en favoritos");

      return {
        ...currentState,
        favoriteIds,
      };
    });
  }

  function toggleFollow(venueId: string, venueName: string) {
    setUiSessionState((currentState) => {
      const isFollowing = currentState.followedVenueIds.includes(venueId);
      const followedVenueIds = isFollowing
        ? currentState.followedVenueIds.filter((id) => id !== venueId)
        : [...currentState.followedVenueIds, venueId];

      showToast(
        isFollowing
          ? `Has dejado de seguir a ${venueName}`
          : `Ahora sigues a ${venueName}`,
      );

      return {
        ...currentState,
        followedVenueIds,
      };
    });
  }

  async function addToCart(item: FeedItem) {
    const fallbackNextState = (() => {
      const itemAlreadyInCart = cartState.itemIds.includes(item.menuItemId);

      if (itemAlreadyInCart) {
        showToast("Este plato ya esta en el carrito");
        return cartState;
      }

      if (cartState.venueId && cartState.venueId !== item.venueId) {
        showToast(`Se ha iniciado un nuevo carrito para ${item.venueName}`);

        return {
          cartId: null,
          venueId: item.venueId,
          venueName: item.venueName,
          itemIds: [item.menuItemId],
          totalItems: 1,
        };
      }

      showToast(`Anadido al carrito: ${item.title}`);

      return {
        cartId: cartState.cartId,
        venueId: item.venueId,
        venueName: item.venueName,
        itemIds: [...cartState.itemIds, item.menuItemId],
        totalItems: cartState.totalItems + 1,
      };
    })();

    if (!cartSessionId) {
      setCartState(fallbackNextState);
      return;
    }

    const persistedCart = await persistCartItem({
      sessionId: cartSessionId,
      venueId: item.venueId,
      menuItemId: item.menuItemId,
    });

    if (persistedCart) {
      const switchedVenue =
        cartState.venueId && cartState.venueId !== persistedCart.venueId;

      if (switchedVenue) {
        showToast(`Se ha iniciado un nuevo carrito para ${item.venueName}`);
      } else if (cartState.itemIds.includes(item.menuItemId)) {
        showToast("Cantidad actualizada en el carrito");
      } else {
        showToast(`Anadido al carrito: ${item.title}`);
      }

      setCartState(persistedCart);
      return;
    }

    setCartState(fallbackNextState);
  }

  function renderFoodGrid(sectionItems: FeedItem[]) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {sectionItems.map((item) => (
          <FoodCard
            key={item.id}
            item={item}
            isFavorite={uiSessionState.favoriteIds.includes(item.id)}
            isInCart={cartState.itemIds.includes(item.menuItemId)}
            onToggleFavorite={() => toggleFavorite(item.id)}
            onAddToCart={() => void addToCart(item)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <HomeHeader
        favoritesCount={uiSessionState.favoriteIds.length}
        cartItemsCount={cartState.totalItems}
      />

      {toast ? (
        <div className="pointer-events-none fixed inset-x-4 top-24 z-40 mx-auto max-w-md">
          <div className="rounded-2xl bg-[color:var(--foreground)] px-4 py-3 text-sm font-medium text-white shadow-lg">
            {toast.message}
          </div>
        </div>
      ) : null}

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <HomeHero
          activeLocation={activeLocation}
          activeCartVenueName={cartVenueName}
          activeCartItemsCount={cartState.totalItems}
        />

        <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
            <SectionHeading
              eyebrow="Tu zona"
              title="Selecciona donde quieres pedir"
              description="Usa una zona mock para validar la navegacion, el descubrimiento local y la jerarquia de la home."
            />
            <div className="mt-6 flex flex-wrap gap-3">
              {locationOptions.map((location) => {
                const isActive = location === activeLocation;

                return (
                  <button
                    key={location}
                    type="button"
                    onClick={() => setActiveLocation(location)}
                    className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-[color:var(--foreground)] text-white"
                        : "bg-white text-[color:var(--foreground)]"
                    }`}
                  >
                    {location}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
            <SectionHeading
              eyebrow="Categorias"
              title="Explora por antojo"
              description="Categorias visuales para navegar rapido entre formatos de comida mas comerciales."
            />
            <div className="mt-6 flex flex-wrap gap-3">
              {categoryItems.map((category) => (
                <span
                  key={category}
                  className="rounded-full bg-[color:var(--surface-strong)] px-4 py-3 text-sm font-semibold text-[color:var(--foreground)]"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <SectionHeading
            eyebrow="Ahora mismo"
            title="Recien hecho cerca de ti"
            description="Una seleccion editorial con platos cercanos y visuales para validar el descubrimiento desde home."
          />
          {renderFoodGrid(nearbyItems)}
        </section>

        <section className="space-y-5">
          <SectionHeading
            eyebrow="Top ventas"
            title="Lo mas pedido"
            description="Contenido comercial para destacar platos con traccion y reforzar confianza en la decision de compra."
          />
          {renderFoodGrid(mostOrderedItems)}
        </section>

        <section className="space-y-5">
          <SectionHeading
            eyebrow="Seguimiento"
            title="Locales que sigues"
            description="Relacion simple entre usuario y comercios favoritos para preparar el futuro panel y la personalizacion."
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {followedVenueSummaries.length > 0 ? (
              followedVenueSummaries.map((venue) => (
                <VenueCard
                  key={venue.venueId}
                  venueName={venue.venueName}
                  venueDistance={venue.venueDistance}
                  dishesCount={venue.dishesCount}
                  isFollowing={uiSessionState.followedVenueIds.includes(
                    venue.venueId,
                  )}
                  onToggleFollow={() => toggleFollow(venue.venueId, venue.venueName)}
                />
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-sm leading-6 text-[color:var(--muted)] lg:col-span-3">
                Aun no sigues locales en esta sesion. Cuando sigas uno, aparecera
                aqui con prioridad editorial.
              </div>
            )}
          </div>
          {followedItems.length > 0 ? renderFoodGrid(followedItems) : null}
        </section>

        <section className="space-y-5 pb-10">
          <SectionHeading
            eyebrow="Catalogo"
            title="Descubre mas platos y locales"
            description="Grid principal para escritorio y movil, con jerarquia mas limpia y enfoque comercial en conversion."
          />
          {renderFoodGrid(orderedItems)}
        </section>
      </main>
    </div>
  );
}
