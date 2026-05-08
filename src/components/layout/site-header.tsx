"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { CartIcon } from "@/components/icons/cart-icon";
import { ClockIcon } from "@/components/icons/clock-icon";
import { CloseIcon } from "@/components/icons/close-icon";
import { LocationPinIcon } from "@/components/icons/location-pin-icon";
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
  { label: "Selección", href: "/platos" },
  { label: "Zonas", href: "/zonas" },
  { label: "Únete", href: "/unete" },
];

const mobileNavigationItems = [
  { label: "Explorar selección", href: "/platos" },
  { label: "Zonas", href: "/zonas" },
  { label: "Tu cesta", href: "/cart" },
  { label: "Únete", href: "/unete" },
  { label: "El proyecto", href: "/el-proyecto" },
];

const logoSrc = "/logo/ZyelnpickLOGO_green.png";
const rotatingCategoryLabels = ["#PLATOS", "#CAFÉS", "#HELADOS", "#TACOS"];

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
    <span className="absolute -right-1.5 -top-1.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#E5484D] px-1 text-[9px] font-semibold leading-none text-white shadow-[0_6px_16px_rgba(0,0,0,0.18)]">
      {getBadgeLabel(totalItems)}
    </span>
  );
}

function ActiveOrderBadge() {
  return (
    <span className="absolute -right-1.5 -top-1.5 inline-flex h-3.5 w-3.5 rounded-full border border-white/45 bg-accent shadow-[0_6px_16px_rgba(0,0,0,0.18)]" />
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
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

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

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveCategoryIndex(
        (currentIndex) => (currentIndex + 1) % rotatingCategoryLabels.length,
      );
    }, 2200);

    return () => window.clearInterval(intervalId);
  }, []);

  const isItemActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  const zoneHref = selectedCity?.slug ? `/zonas/${selectedCity.slug}` : "/zonas";
  const activeCategoryLabel = rotatingCategoryLabels[activeCategoryIndex];

  const dockRailClassName =
    "bg-transparent";
  const dockButtonClassName =
    "border-transparent bg-transparent text-white/82 hover:bg-white/[0.075] hover:text-white";
  const orderButtonClassName = hasOrderSignal
    ? "border-[#11D470]/28 bg-[#11D470]/10 text-[#11D470] hover:bg-[#11D470]/16"
    : dockButtonClassName;
  const cityButtonClassName = selectedCity?.slug
    ? "border-[#11D470]/28 bg-[#11D470]/10 text-[#11D470] hover:bg-[#11D470]/16"
    : dockButtonClassName;

  return (
    <header className="sticky top-[max(0.7rem,env(safe-area-inset-top))] z-40 px-3 sm:px-6 lg:px-8">
      <div className="relative mx-auto w-full max-w-7xl">
        <div className="rounded-full border border-white/10 bg-[#07100d]/42 px-2 py-1.5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl backdrop-saturate-150 sm:px-2.5">
          <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2 md:hidden">
            {showNavigation ? (
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((value) => !value)}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation"
                aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${dockButtonClassName}`}
              >
                {isMobileMenuOpen ? <CloseIcon size={16} /> : <MenuIcon size={16} />}
              </button>
            ) : (
              <span className="h-9 w-9" aria-hidden="true" />
            )}

            <div className="flex min-w-0 flex-col items-center justify-center gap-0.5">
              <Link
                href="/"
                className="inline-flex min-h-[22px] items-center justify-center"
                aria-label="Ir al inicio"
              >
                <Image
                  src={logoSrc}
                  alt="ZylenPick"
                  width={210}
                  height={42}
                  priority
                  className="h-auto w-[48px]"
                />
              </Link>
              <span
                key={activeCategoryLabel}
                className="block h-3 text-[9px] font-black leading-none tracking-[0.14em] text-[#11D470]"
              >
                {activeCategoryLabel}
              </span>
            </div>

            <Link
              href={orderAccessHref}
              aria-label={orderAccessLabel}
              className={`relative inline-flex items-center justify-center justify-self-end rounded-full border transition ${showActiveOrderAccess && activeOrderTimeLabel ? "h-9 min-w-[2.5rem] px-1.5 text-[10px] font-semibold tracking-[0.04em]" : "h-9 w-9"} ${orderButtonClassName}`}
            >
              {showActiveOrderAccess ? (
                <ActiveOrderIndicator
                  timeLabel={activeOrderTimeLabel}
                  iconSize={16}
                />
              ) : (
                <>
                  <CartIcon size={18} />
                  <CartBadge totalItems={totals.totalItems} />
                </>
              )}
            </Link>
          </div>

          <div className="hidden items-center md:grid md:grid-cols-[auto_1fr_auto] md:gap-4">
            <div className="flex items-center justify-start gap-2.5">
              <Link
                href="/"
                className="inline-flex min-h-[22px] items-center justify-center px-1.5 transition hover:opacity-85"
                aria-label="Ir al inicio"
              >
                <Image
                  src={logoSrc}
                  alt="ZylenPick"
                  width={210}
                  height={42}
                  priority
                  className="h-auto w-[54px]"
                />
              </Link>
              <span
                key={activeCategoryLabel}
                className="inline-flex h-7 min-w-[5.6rem] items-center justify-center rounded-full border border-[#11D470]/22 bg-[#11D470]/10 px-2.5 text-[10px] font-black leading-none tracking-[0.16em] text-[#11D470]"
              >
                {activeCategoryLabel}
              </span>
            </div>

            {showNavigation ? (
              <nav aria-label="Navegación principal" className="flex justify-center">
                <div
                  className={`inline-flex items-center gap-0.5 rounded-full ${dockRailClassName}`}
                >
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold tracking-normal transition ${
                        isItemActive(item.href)
                          ? "bg-[#11D470] font-bold text-[#062113] shadow-[0_10px_30px_rgba(17,212,112,0.28)]"
                          : "text-white/68 hover:-translate-y-[1px] hover:bg-white/[0.07] hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </nav>
            ) : null}

            <div className="inline-flex items-center justify-self-end gap-2">
              <Link
                href={orderAccessHref}
                aria-label={orderAccessLabel}
                className={`relative inline-flex items-center justify-center rounded-full border transition ${showActiveOrderAccess && activeOrderTimeLabel ? "h-9 min-w-[3.15rem] px-2.5 text-[10px] font-semibold tracking-[0.04em]" : "h-9 w-9"} ${orderButtonClassName}`}
              >
                {showActiveOrderAccess ? (
                  <ActiveOrderIndicator
                    timeLabel={activeOrderTimeLabel}
                    iconSize={17}
                  />
                ) : (
                  <>
                    <CartIcon size={18} />
                    <CartBadge totalItems={totals.totalItems} />
                  </>
                )}
              </Link>

              <Link
                href={zoneHref}
                aria-label={selectedCity?.name ?? "Elegir zona"}
                className={`group/location relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${cityButtonClassName}`}
              >
                <LocationPinIcon size={18} className="shrink-0" />
                <span className="pointer-events-none absolute right-0 top-[calc(100%+0.55rem)] z-50 max-w-[14rem] translate-y-1 whitespace-nowrap rounded-full border border-white/14 bg-black/58 px-3 py-1.5 text-[11px] font-semibold text-white/84 opacity-0 shadow-[0_14px_36px_rgba(0,0,0,0.24)] backdrop-blur-xl backdrop-saturate-150 transition duration-200 group-hover/location:translate-y-0 group-hover/location:opacity-100 group-focus-visible/location:translate-y-0 group-focus-visible/location:opacity-100">
                  {selectedCity?.name ?? "Elegir zona"}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {showNavigation && isMobileMenuOpen ? (
          <div
            id="mobile-navigation"
            className="absolute inset-x-0 top-[calc(100%+0.7rem)] z-50 rounded-[1.35rem] border border-white/16 bg-white/[0.10] p-3 text-white shadow-[0_20px_48px_rgba(0,0,0,0.22)] backdrop-blur-2xl backdrop-saturate-150 md:hidden"
          >
            <nav aria-label="Navegación móvil">
              <ul className="grid gap-2">
                {mobileNavigationItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-[1rem] px-4 py-3 text-sm font-medium transition ${
                        isItemActive(item.href)
                          ? "bg-white/[0.08] text-white"
                          : "text-white/76 hover:bg-white/[0.05]"
                      }`}
                    >
                      {item.href === "/cart" ? (
                        <span className="relative inline-flex h-5 w-5 items-center justify-center">
                          <CartIcon size={21} />
                          <CartBadge totalItems={totals.totalItems} />
                        </span>
                      ) : item.href === "/zonas" ? (
                        <LocationPinIcon
                          size={21}
                          className={selectedCity?.slug ? "shrink-0 text-[#11D470]" : "shrink-0"}
                        />
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
