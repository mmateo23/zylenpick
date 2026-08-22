"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Info, LayoutGrid, Map, MapPinned, ReceiptText, Store } from "lucide-react";

import { CartIcon } from "@/components/icons/cart-icon";
import { ClockIcon } from "@/components/icons/clock-icon";
import { CloseIcon } from "@/components/icons/close-icon";
import { MenuIcon } from "@/components/icons/menu-icon";
import { useCart } from "@/features/cart/hooks/use-cart";
import {
  readSelectedCity,
  SELECTED_CITY_UPDATED_EVENT,
  type StoredCity,
} from "@/features/location/city-preference";
import { useActiveOrder } from "@/features/orders/hooks/use-active-order";

type SiteHeaderProps = {
  showNavigation?: boolean;
};

const navigationItems = [
  { label: "Mapa", href: "/mapa", Icon: Map },
  { label: "Platos", href: "/platos", Icon: LayoutGrid },
  { label: "Zonas", href: "/zonas", Icon: MapPinned },
];

const mobileNavigationItems = [
  { label: "Explorar mapa", href: "/mapa" },
  { label: "Explorar platos", href: "/platos" },
  { label: "Zonas", href: "/zonas" },
  { label: "Tu cesta", href: "/cart" },
  { label: "Pedidos", href: "/pedidos" },
  { label: "\u00danete", href: "/unete" },
  { label: "El proyecto", href: "/el-proyecto" },
];

const logoSrc = "/icons/pickyalo-app.svg";
const mobileLogoSrc = "/icons/pickyalo-app.svg";
const mapDiscoveryHref = "/mapa?localizar=1";

function getNavigationHref(href: string) {
  return href === "/mapa" ? mapDiscoveryHref : href;
}

function formatActiveOrderTime(pickupAt: string | null | undefined) {
  if (!pickupAt) {
    return null;
  }

  const date = new Date(pickupAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getBadgeLabel(totalItems: number) {
  return totalItems > 9 ? "9+" : String(totalItems);
}

type CartBadgeProps = {
  totalItems: number;
};

function CartBadge({ totalItems }: CartBadgeProps) {
  if (totalItems <= 0) {
    return null;
  }

  return (
    <span className="absolute -right-1.5 -top-1.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-semibold leading-none text-white shadow-[var(--shadow-soft)]">
      {getBadgeLabel(totalItems)}
    </span>
  );
}

function ActiveOrderBadge() {
  return (
    <span className="absolute -right-1.5 -top-1.5 inline-flex h-3.5 w-3.5 rounded-full border border-page bg-cta shadow-[var(--shadow-soft)]" />
  );
}

function ActiveOrderIndicator({
  timeLabel,
  iconSize,
}: {
  timeLabel: string | null;
  iconSize: number;
}) {
  return (
    <>
      <span className="inline-flex items-center gap-1.5">
        <ClockIcon size={iconSize} />
        {timeLabel ? <span>{timeLabel}</span> : null}
      </span>
      <ActiveOrderBadge />
    </>
  );
}

export function SiteHeader({ showNavigation = true }: SiteHeaderProps) {
  const pathname = usePathname();
  const { totals } = useCart();
  const { activeOrder } = useActiveOrder();
  const [selectedCity, setSelectedCity] = useState<StoredCity | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const hasCartItems = totals.totalItems > 0;
  const activeOrderHref = activeOrder ? `/checkout/success/${activeOrder.id}` : null;
  const orderAccessHref = hasCartItems || !activeOrderHref ? "/cart" : activeOrderHref;
  const orderAccessLabel = hasCartItems
    ? "Tu cesta"
    : activeOrderHref
      ? "Pedido activo"
      : "Tu cesta";
  const showActiveOrderAccess = !hasCartItems && Boolean(activeOrderHref);
  const activeOrderTimeLabel = showActiveOrderAccess
    ? formatActiveOrderTime(activeOrder?.pickupAt)
    : null;
  const hasOrderSignal = hasCartItems || showActiveOrderAccess;

  useEffect(() => {
    setSelectedCity(readSelectedCity());

    const handleSelectedCityUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<StoredCity>;
      setSelectedCity(customEvent.detail);
    };

    const handleStorage = () => {
      setSelectedCity(readSelectedCity());
    };

    window.addEventListener(SELECTED_CITY_UPDATED_EVENT, handleSelectedCityUpdated);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        SELECTED_CITY_UPDATED_EVENT,
        handleSelectedCityUpdated,
      );
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isItemActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  const zoneHref = selectedCity?.slug ? `/zonas/${selectedCity.slug}` : "/zonas";

  const dockRailClassName =
    "border-[var(--floating-surface-border)] bg-[var(--floating-surface)] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.90),0_12px_30px_rgba(56,25,50,0.14)] backdrop-blur-xl backdrop-saturate-150";
  const dockButtonClassName =
    "border-transparent bg-transparent text-[#741314] hover:border-[#741314]/18 hover:bg-[#741314]/10 hover:text-[#741314]";
  const mobileDockButtonClassName =
    "border-transparent bg-transparent text-[#741314] hover:border-[#741314]/18 hover:bg-[#741314]/10";
  const orderButtonClassName = hasOrderSignal
    ? "border-[#741314] bg-[#741314] text-[#FDE3AD] hover:bg-[#5F0F10]"
    : dockButtonClassName;
  const mobileOrderButtonClassName = hasOrderSignal
    ? "border-[#741314] bg-[#741314] text-[#FDE3AD] shadow-[0_8px_20px_rgba(116,19,20,0.2)]"
    : mobileDockButtonClassName;
  const desktopLeftDockItems = [
    navigationItems[0],
    navigationItems[1],
  ];
  const desktopRightDockItems = [
    navigationItems[2],
  ];

  return (
    <header className="sticky top-[max(0.7rem,env(safe-area-inset-top))] z-40 px-3 sm:px-6 lg:px-8">
      <div className="relative mx-auto w-full max-w-7xl">
        <div className="pickyalo-floating-surface mx-auto w-fit rounded-full border px-2 py-1.5 md:border-transparent md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none">
          <div className={`${showNavigation ? "grid grid-cols-[repeat(5,2.75rem)] gap-2" : "flex gap-2"} items-center justify-center md:hidden`}>
            {showNavigation ? (
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((value) => !value)}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation"
                aria-label={isMobileMenuOpen ? "Cerrar men\u00fa" : "Abrir men\u00fa"}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${mobileDockButtonClassName}`}
              >
                {isMobileMenuOpen ? <CloseIcon size={25} /> : <MenuIcon size={25} />}
              </button>
            ) : (
              <span className="h-11 w-11" aria-hidden="true" />
            )}

            {showNavigation ? (
              <Link
                href={mapDiscoveryHref}
                aria-label="Explorar mapa"
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
                  isItemActive("/mapa")
                    ? "border-[#741314] bg-[#741314] text-[#FDE3AD]"
                    : mobileDockButtonClassName
                }`}
              >
                <Map size={26} strokeWidth={2.05} />
              </Link>
            ) : null}

            <Link
              href="/"
              className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-[0.9rem] transition hover:opacity-90"
              aria-label="Ir al inicio"
            >
              <Image
                src={mobileLogoSrc}
                alt="Pickyalo"
                width={44}
                height={44}
                priority
                className="h-11 w-11 object-cover"
              />
            </Link>

            {showNavigation ? (
              <Link
                href="/platos"
                aria-label="Explorar platos"
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
                  isItemActive("/platos")
                    ? "border-[#741314] bg-[#741314] text-[#FDE3AD]"
                    : mobileDockButtonClassName
                }`}
              >
                <LayoutGrid size={26} strokeWidth={2.05} />
              </Link>
            ) : null}

            <Link
              href={orderAccessHref}
              aria-label={orderAccessLabel}
              className={`relative inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${mobileOrderButtonClassName}`}
            >
              {showActiveOrderAccess ? (
                <ActiveOrderIndicator
                  timeLabel={null}
                  iconSize={20}
                />
              ) : (
                <>
                  <CartIcon size={25} />
                  <CartBadge totalItems={totals.totalItems} />
                </>
              )}
            </Link>

          </div>

          <div className="hidden items-center justify-center md:flex">
            <nav
              aria-label="Navegación principal"
              className={`inline-flex items-center gap-1.5 rounded-[1.7rem] ${dockRailClassName}`}
            >
              {showNavigation
                ? desktopLeftDockItems.map((item) => {
                    const Icon = item.Icon;
                    const href = getNavigationHref(item.href);
                    const label = item.label;

                    return (
                      <Link
                        key={item.href}
                        href={href}
                        aria-label={label}
                        title={label}
                        className={`group/nav relative inline-flex h-14 w-[4.35rem] flex-col items-center justify-center gap-1 rounded-[1.25rem] border outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-[#741314]/28 ${
                          isItemActive(item.href)
                            ? "border-[#741314] bg-[#741314] text-[#FDE3AD] shadow-[0_10px_22px_rgba(116,19,20,0.18)]"
                            : "border-transparent text-[#741314]/72 hover:-translate-y-[1px] hover:bg-[#741314]/10 hover:text-[#741314]"
                        }`}
                      >
                        <Icon size={24} strokeWidth={2.05} />
                        <span className="max-w-full truncate px-1 text-[10px] font-semibold leading-none tracking-[-0.01em]">
                          {label}
                        </span>
                      </Link>
                    );
                  })
                : null}

              <Link
                href="/"
                className="inline-flex h-14 w-14 items-center justify-center rounded-[1.25rem] transition hover:bg-[#741314]/8"
                aria-label="Ir al inicio"
              >
                <Image
                  src={logoSrc}
                  alt="Pickyalo"
                  width={56}
                  height={56}
                  priority
                  className="h-12 w-12 rounded-[0.9rem] object-cover"
                />
              </Link>

              {showNavigation
                ? desktopRightDockItems.map((item) => {
                    const Icon = item.Icon;
                    const href = item.href === "/zonas" ? zoneHref : item.href;

                    return (
                      <Link
                        key={item.href}
                        href={href}
                        aria-label={item.label}
                        title={item.label}
                        className={`group/nav relative inline-flex h-14 w-[4.35rem] flex-col items-center justify-center gap-1 rounded-[1.25rem] border outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-[#741314]/28 ${
                          isItemActive(item.href)
                            ? "border-[#741314] bg-[#741314] text-[#FDE3AD] shadow-[0_10px_22px_rgba(116,19,20,0.18)]"
                            : "border-transparent text-[#741314]/72 hover:-translate-y-[1px] hover:bg-[#741314]/10 hover:text-[#741314]"
                        }`}
                      >
                        <Icon size={24} strokeWidth={2.05} />
                        <span className="max-w-full truncate px-1 text-[10px] font-semibold leading-none tracking-[-0.01em]">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })
                : null}

              <Link
                href={orderAccessHref}
                aria-label={orderAccessLabel}
                title={orderAccessLabel}
                className={`relative inline-flex h-14 w-[4.35rem] flex-col items-center justify-center gap-1 rounded-[1.25rem] border px-1 text-[10px] font-semibold tracking-[0.04em] transition ${orderButtonClassName}`}
              >
                {showActiveOrderAccess ? (
                  <ActiveOrderIndicator
                    timeLabel={activeOrderTimeLabel}
                    iconSize={18}
                  />
                ) : (
                  <>
                    <CartIcon size={24} />
                    <CartBadge totalItems={totals.totalItems} />
                    <span className="max-w-full truncate px-1 text-[10px] font-semibold leading-none tracking-[-0.01em]">
                      Cesta
                    </span>
                  </>
                )}
              </Link>
            </nav>
          </div>
        </div>

        {showNavigation && isMobileMenuOpen ? (
          <div
            id="mobile-navigation"
            className="absolute inset-x-0 top-[calc(100%+0.7rem)] z-50 rounded-[1.35rem] border border-[#741314]/14 bg-[#FFF7E8]/80 p-3 text-[#741314] shadow-[var(--shadow-soft)] backdrop-blur-2xl backdrop-saturate-150 md:hidden"
          >
            <nav aria-label="Navegación móvil">
              <ul className="grid gap-2">
                {mobileNavigationItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={getNavigationHref(item.href)}
                      className={`flex items-center gap-3 rounded-[1rem] px-4 py-3 text-sm font-medium transition ${
                        isItemActive(item.href)
                          ? "bg-[#741314] text-[#FDE3AD]"
                          : "text-[#741314]/78 hover:bg-[#741314]/10 hover:text-[#741314]"
                      }`}
                    >
                      {item.href === "/cart" ? (
                        <span className="relative inline-flex h-5 w-5 items-center justify-center">
                          <CartIcon size={21} />
                          <CartBadge totalItems={totals.totalItems} />
                        </span>
                      ) : item.href === "/zonas" ? (
                        <MapPinned
                          size={21}
                          className={selectedCity?.slug ? "shrink-0 text-[#741314]" : "shrink-0"}
                        />
                      ) : item.href === "/mapa" ? (
                        <Map size={21} className="shrink-0" />
                      ) : item.href === "/platos" ? (
                        <LayoutGrid size={21} className="shrink-0" />
                      ) : item.href === "/pedidos" ? (
                        <ReceiptText size={21} className="shrink-0" />
                      ) : item.href === "/unete" ? (
                        <Store size={21} className="shrink-0" />
                      ) : item.href === "/el-proyecto" ? (
                        <Info size={21} className="shrink-0" />
                      ) : null}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}



