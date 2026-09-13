"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Maximize2, Phone, X } from "lucide-react";
import { useScrollContentHint } from "@/components/ui/scroll-content-hint";

import type { VenueQrSponsor } from "@/features/venues/qr-sponsor-config";
import type { VenueDetails, VenueMenuItem } from "@/features/venues/types";
import {
  captureQrVenueEvent,
  type QrVenueEventProperties,
} from "@/lib/analytics/posthog-events";

type ProductSource = "featured" | "catalog";

type ActivePanel =
  | { kind: "product"; item: VenueMenuItem; source: ProductSource }
  | { kind: "promo"; sponsor: VenueQrSponsor; relatedItem: VenueMenuItem | null }
  | { kind: "story" }
  | null;

type QrInteractionContextValue = {
  openProduct: (item: VenueMenuItem, source: ProductSource) => void;
  openPromo: (sponsor: VenueQrSponsor, relatedItem: VenueMenuItem | null) => void;
  openStory: () => void;
};

type VenueQrInteractionProviderProps = {
  venue: VenueDetails;
  children: ReactNode;
};

type ProductTriggerProps = {
  item: VenueMenuItem;
  source: ProductSource;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
};

type PromoTriggerProps = {
  sponsor: VenueQrSponsor;
  relatedItem: VenueMenuItem | null;
  className?: string;
  children: ReactNode;
};

type StoryTriggerProps = {
  className?: string;
  children: ReactNode;
};

type TrackedActionLinkProps = {
  href: string;
  eventName: "qr_help_clicked";
  properties: QrVenueEventProperties;
  className?: string;
  children: ReactNode;
};

const QrInteractionContext = createContext<QrInteractionContextValue | null>(
  null,
);

const allergenLabels: Record<string, string> = {
  gluten: "Gluten",
  crustaceos: "Crustáceos",
  huevo: "Huevo",
  pescado: "Pescado",
  cacahuetes: "Cacahuetes",
  soja: "Soja",
  leche: "Leche",
  frutos_de_cascara: "Frutos de cáscara",
  apio: "Apio",
  mostaza: "Mostaza",
  sesamo: "Sésamo",
  sulfitos: "Sulfitos",
  altramuces: "Altramuces",
  moluscos: "Moluscos",
};

function useQrInteraction() {
  const context = useContext(QrInteractionContext);
  if (!context) {
    throw new Error("QR interaction controls must be inside their provider.");
  }
  return context;
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("hidden"));
}

export function VenueQrInteractionProvider({
  venue,
  children,
}: VenueQrInteractionProviderProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [photoExpanded, setPhotoExpanded] = useState(false);
  const { scrollRef, canScrollMore, scrollForward } = useScrollContentHint<HTMLDivElement>(
    activePanel ? `${activePanel.kind}:${photoExpanded}` : null,
  );
  const triggerRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const pushedHistoryRef = useRef(false);

  const baseProperties = useCallback(
    () => ({
      venue_id: venue.id,
      venue_slug: venue.slug,
      city_slug: venue.city.slug,
    }),
    [venue.city.slug, venue.id, venue.slug],
  );

  const closeDirectly = useCallback(() => {
    setPhotoExpanded(false);
    setActivePanel((current) => {
      if (current?.kind === "product") {
        captureQrVenueEvent("qr_product_closed", {
          ...baseProperties(),
          product_id: current.item.id,
          product_name: current.item.name,
          product_source: current.source,
        });
      }
      return null;
    });
    pushedHistoryRef.current = false;
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, [baseProperties]);

  const requestClose = useCallback(() => {
    if (photoExpanded) {
      setPhotoExpanded(false);
      window.requestAnimationFrame(() => document.getElementById("qr-expand-photo")?.focus());
      return;
    }
    if (pushedHistoryRef.current && window.history.state?.pickyaloQrPanel) {
      window.history.back();
      return;
    }
    closeDirectly();
  }, [closeDirectly, photoExpanded]);

  const prepareOpen = useCallback(() => {
    triggerRef.current = document.activeElement as HTMLElement | null;
    if (!pushedHistoryRef.current) {
      window.history.pushState(
        { ...window.history.state, pickyaloQrPanel: true },
        "",
        window.location.href,
      );
      pushedHistoryRef.current = true;
    }
  }, []);

  const openProduct = useCallback(
    (item: VenueMenuItem, source: ProductSource) => {
      prepareOpen();
      setActivePanel({ kind: "product", item, source });
      captureQrVenueEvent("qr_product_opened", {
        ...baseProperties(),
        product_id: item.id,
        product_name: item.name,
        product_category: item.categoryName,
        product_source: source,
      });
    },
    [baseProperties, prepareOpen],
  );

  const openPromo = useCallback(
    (sponsor: VenueQrSponsor, relatedItem: VenueMenuItem | null) => {
      prepareOpen();
      setActivePanel({ kind: "promo", sponsor, relatedItem });
      captureQrVenueEvent("qr_promo_opened", {
        ...baseProperties(),
        promo_id: sponsor.id,
        sponsor_name: sponsor.brandName,
      });
    },
    [baseProperties, prepareOpen],
  );

  const openStory = useCallback(() => {
    prepareOpen();
    setActivePanel({ kind: "story" });
  }, [prepareOpen]);

  useEffect(() => {
    if (!activePanel) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    const handlePopState = () => closeDirectly();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = getFocusableElements(panelRef.current);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("popstate", handlePopState);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePanel, closeDirectly, requestClose]);

  return (
    <QrInteractionContext.Provider value={{ openProduct, openPromo, openStory }}>
      {children}
      {activePanel ? createPortal(
        <div
          className="public-light-theme fixed inset-0 z-[150] flex items-end justify-center p-0 text-[#24110E] sm:items-center sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) requestClose();
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[#24110E]/[0.62]" aria-hidden="true" />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="qr-panel-title"
            className={`relative z-10 flex w-full flex-col overflow-hidden bg-[#FFF7E8] shadow-xl ${photoExpanded ? "h-[100dvh] max-h-[100dvh] sm:fixed sm:inset-0" : "sm:max-w-4xl sm:rounded-3xl"} ${
              photoExpanded ? "" :
              activePanel.kind === "story"
                ? "h-[100dvh] max-h-[100dvh] rounded-none sm:h-auto sm:max-h-[90dvh]"
                : "max-h-[94dvh] rounded-t-3xl sm:max-h-[90dvh]"
            }`}
          >
            <div className="z-20 flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-[#741314]/15 bg-[#FFF7E8] px-4 pt-[env(safe-area-inset-top)] sm:px-6 sm:pt-0">
              <p className="text-xs font-semibold text-[#741314]">
                {photoExpanded ? "Fotografías · " + (activePanel.kind === "product" ? activePanel.item.name : "") : activePanel.kind === "product"
                  ? "Para pedir aquí"
                  : activePanel.kind === "promo"
                    ? "Colaboración"
                    : "Conoce la casa"}
              </p>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={requestClose}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#741314]/22 text-[#741314] outline-none transition hover:bg-[#FDE3AD]/45 focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2"
                aria-label={photoExpanded ? "Volver al plato" : "Cerrar ficha"}
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <div ref={scrollRef} className="min-h-0 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
            {activePanel.kind === "product" ? (
              <ProductPanel item={activePanel.item} venue={venue} expanded={photoExpanded} onExpand={() => setPhotoExpanded(true)} />
            ) : activePanel.kind === "promo" ? (
              <PromoPanel
                sponsor={activePanel.sponsor}
                relatedItem={activePanel.relatedItem}
              />
            ) : (
              <VenueStoryPanel venue={venue} />
            )}
            </div>
            {!photoExpanded && canScrollMore ? (
              <button type="button" onClick={scrollForward} className="flex min-h-11 shrink-0 items-center justify-center gap-2 border-t border-[#741314]/15 bg-[#FFF7E8] px-4 py-2 text-sm font-semibold text-[#741314] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#741314]">
                Sigue leyendo <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>,
        document.body,
      ) : null}
    </QrInteractionContext.Provider>
  );
}

function VenueStoryPanel({ venue }: { venue: VenueDetails }) {
  const fallbackImages = [venue.qrHeroImageUrl, venue.coverUrl].filter(
    (url): url is string => Boolean(url),
  );
  const images = Array.from(
    new Set(
      venue.qrStoryImageUrls.length > 0
        ? venue.qrStoryImageUrls
        : fallbackImages,
    ),
  ).slice(0, 3);
  const story = venue.qrStory ?? venue.description;

  return (
    <article className="pb-[max(2rem,env(safe-area-inset-bottom))]">
      {images[0] ? (
        <div className="relative h-[min(32dvh,22rem)] w-full bg-[#F6D99A]">
          <Image
            src={images[0]}
            alt={`Historia de ${venue.name}`}
            fill
            sizes="(max-width: 767px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="mx-auto max-w-2xl px-5 py-5 sm:px-8 sm:py-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#741314]/65">
          {venue.discoveryCategory ?? "El local"}
        </p>
        <h2
          id="qr-panel-title"
          className="font-pickyalo-wordmark mt-2 break-words text-balance text-3xl leading-tight text-[#24110E] sm:text-4xl"
        >
          {venue.name}
        </h2>
        {story ? (
          <div className="mt-4 whitespace-pre-line text-base leading-7 text-[#24110E]">
            {story}
          </div>
        ) : null}
        {venue.qrHostName ? (
          <p className="mt-6 border-l-2 border-[#741314] pl-4 text-base font-semibold leading-7 text-[#741314]">
            Si tienes dudas, pregunta a {venue.qrHostName}.
          </p>
        ) : null}

        {images.length > 1 ? (
          <div className="mt-8 grid grid-cols-2 gap-3">
            {images.slice(1).map((imageUrl, index) => (
              <div
                key={imageUrl}
                className="relative aspect-[4/3] overflow-hidden rounded-[16px] bg-[#F6D99A]"
              >
                <Image
                  src={imageUrl}
                  alt={`Detalle ${index + 2} de ${venue.name}`}
                  fill
                  sizes="(max-width: 767px) 50vw, 360px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function ProductPanel({ item, venue, expanded, onExpand }: { item: VenueMenuItem; venue: VenueDetails; expanded: boolean; onExpand: () => void }) {
  const images = Array.from(new Set([item.imageUrl, ...item.galleryImageUrls].filter((url): url is string => Boolean(url))));
  const [imageIndex, setImageIndex] = useState(0);
  const imageUrl = images[imageIndex] ?? null;
  function changeImage(direction: number) {
    setImageIndex((current) => (current + direction + images.length) % images.length);
  }

  return (
    <div className={expanded ? "" : "grid items-start sm:grid-cols-2"}>
      {expanded ? <h2 id="qr-panel-title" className="sr-only">Fotografías de {item.name}</h2> : null}
      <div className={`relative w-full overflow-hidden ${expanded ? "h-[calc(100dvh-4rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-[#24110E]" : "h-[min(30dvh,18rem)] bg-[#F6D99A]/30 sm:aspect-[4/5] sm:h-auto"}`}
        onKeyDown={(event) => {
          if (images.length < 2) return;
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            changeImage(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
      >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${item.name} en ${venue.name}`}
              fill
              sizes={expanded ? "100vw" : "(max-width: 639px) 100vw, 448px"}
              className={expanded ? "object-contain" : "object-cover"}
            />
          ) : (
            <div className="flex h-full items-center justify-center px-8 text-center text-sm font-semibold text-[#741314]/65">
              Fotografía pendiente
            </div>
          )}
          {imageUrl && !expanded ? (
            <button id="qr-expand-photo" type="button" onClick={onExpand} aria-label="Ampliar fotografía" className="absolute inset-0 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#FFF7E8]">
              <span className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-[#FFF7E8] text-[#741314] shadow-sm"><Maximize2 className="h-5 w-5" aria-hidden="true" /></span>
            </button>
          ) : null}
          {images.length > 1 ? (
            <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3">
              <button type="button" onClick={() => changeImage(-1)} aria-label="Foto anterior" className="grid h-11 w-11 place-items-center rounded-full bg-[#FFF7E8] text-[#741314] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#741314]"><ChevronLeft className="h-5 w-5" aria-hidden="true" /></button>
              <span aria-live="polite" aria-atomic="true" className="rounded-full bg-[#FFF7E8] px-3 py-1.5 text-xs font-semibold text-[#741314]">Foto {imageIndex + 1} de {images.length}</span>
              <button type="button" onClick={() => changeImage(1)} aria-label="Foto siguiente" className="grid h-11 w-11 place-items-center rounded-full bg-[#FFF7E8] text-[#741314] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#741314]"><ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
            </div>
          ) : null}
      </div>
      {!expanded ? <div className="min-w-0 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          {item.categoryName ? (
            <span className="border-b border-[#741314]/35 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#741314]">
              {item.categoryName}
            </span>
          ) : null}
          {item.isFeatured ? (
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#741314]/62">
              Favorito de la casa
            </span>
          ) : null}
        </div>
        <h2
          id="qr-panel-title"
          className="font-pickyalo-wordmark mt-2 break-words text-balance text-2xl leading-tight text-[#24110E] sm:text-4xl"
        >
          {item.name}
        </h2>
        {item.description ? (
          <p className="mt-3 text-base leading-7 text-[#24110E]">
            {item.description}
          </p>
        ) : null}
        {item.allergens.length > 0 ? (
          <div className="mt-5 border-t border-[#741314]/16 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#741314]/64">
              Alérgenos declarados
            </p>
            <p className="mt-2 text-sm leading-6 text-[#24110E]/68">
              {item.allergens.map((allergen) => allergenLabels[allergen] ?? allergen).join(", ")}
            </p>
          </div>
        ) : null}
        <p className="mt-5 rounded-lg bg-[#FDE3AD]/40 px-4 py-3 text-base font-semibold leading-6 text-[#741314]">
          {venue.qrHostName
            ? `Pídeselo a ${venue.qrHostName}.`
            : "Pídeselo al personal."}
        </p>
      </div> : null}
    </div>
  );
}

function PromoPanel({
  sponsor,
  relatedItem,
}: {
  sponsor: VenueQrSponsor;
  relatedItem: VenueMenuItem | null;
}) {
  const imageUrl = sponsor.productImageUrl ?? sponsor.logoUrl ?? null;

  return (
    <div className="grid items-start gap-4 p-4 sm:grid-cols-2 sm:gap-6 sm:p-6">
      <div className="relative aspect-[4/3] max-h-[32dvh] overflow-hidden rounded-2xl bg-[#741314] sm:aspect-square sm:max-h-none">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`Colaboración con ${sponsor.brandName}`}
            fill
            sizes="(max-width: 639px) 100vw, 400px"
            className="object-contain p-8"
          />
        ) : (
          <div className="font-pickyalo-wordmark flex h-full items-center justify-center p-8 text-center text-3xl leading-none tracking-[-0.015em] text-[#FFF7E8]">
            {sponsor.brandName}
          </div>
        )}
      </div>
      <div className="min-w-0 pb-2 sm:py-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#741314]">
          {sponsor.brandName}
        </p>
        <h2
          id="qr-panel-title"
          className="font-pickyalo-wordmark mt-3 break-words text-balance text-3xl leading-tight text-[#24110E] sm:text-4xl"
        >
          {sponsor.headline}
        </h2>
        <p className="mt-3 text-base leading-7 text-[#24110E]">
          {sponsor.description}
        </p>
        {relatedItem ? (
          <p className="mt-6 border-l-2 border-[#741314] pl-4 text-base font-semibold leading-6 text-[#741314]">
            Combínala con {relatedItem.name}.
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function QrProductTrigger({
  item,
  source,
  className,
  ariaLabel,
  children,
}: ProductTriggerProps) {
  const { openProduct } = useQrInteraction();
  return (
    <button
      type="button"
      onClick={() => openProduct(item, source)}
      className={className}
      aria-label={ariaLabel ?? `Ver plato: ${item.name}`}
    >
      {children}
    </button>
  );
}

export function QrPromoTrigger({
  sponsor,
  relatedItem,
  className,
  children,
}: PromoTriggerProps) {
  const { openPromo } = useQrInteraction();
  return (
    <button
      type="button"
      onClick={() => openPromo(sponsor, relatedItem)}
      className={className}
    >
      {children}
    </button>
  );
}

export function QrVenueStoryTrigger({
  className,
  children,
}: StoryTriggerProps) {
  const { openStory } = useQrInteraction();
  return (
    <button type="button" onClick={openStory} className={className}>
      {children}
    </button>
  );
}

export function QrTrackedActionLink({
  href,
  eventName,
  properties,
  className,
  children,
}: TrackedActionLinkProps) {
  return (
    <a
      href={href}
      onClick={() => captureQrVenueEvent(eventName, properties)}
      className={className}
    >
      {children}
    </a>
  );
}

export function QrHelpPhoneIcon() {
  return <Phone aria-hidden="true" className="h-4 w-4" />;
}
