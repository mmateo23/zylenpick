"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { CartIcon } from "@/components/icons/cart-icon";
import { CloseIcon } from "@/components/icons/close-icon";
import { LocationPinIcon } from "@/components/icons/location-pin-icon";
import { MenuIcon } from "@/components/icons/menu-icon";
import { useCart } from "@/features/cart/hooks/use-cart";
import {
  readSelectedCity,
  SELECTED_CITY_UPDATED_EVENT,
  type StoredCity,
} from "@/features/location/city-preference";

type SiteHeaderProps = {
  showNavigation?: boolean;
};

const navigationItems = [
  { label: "Platos", href: "/platos" },
  { label: "Zonas", href: "/zonas" },
  { label: "Proyecto", href: "/el-proyecto" },
  { label: "Unete", href: "/unete" },
];

const logoSrc = "/logo/ZyelnpickLOGO_green.png";

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

export function SiteHeader({ showNavigation = true }: SiteHeaderProps) {
  const pathname = usePathname();
  const { totals } = useCart();
  const [selectedCity, setSelectedCity] = useState<StoredCity | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    "border-white/16 bg-white/[0.10] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]";
  const dockButtonClassName =
    "border-white/16 bg-white/[0.09] text-white hover:-translate-y-[1px] hover:bg-white/[0.15]";
  const cityButtonClassName = selectedCity?.slug
    ? "border-white/18 bg-white/[0.11] text-white hover:bg-white/[0.16]"
    : dockButtonClassName;

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="relative mx-auto w-full max-w-7xl">
        <div className="rounded-[1.55rem] border border-white/16 bg-white/[0.10] px-3.5 py-2 text-white shadow-[0_20px_48px_rgba(0,0,0,0.22)] backdrop-blur-2xl backdrop-saturate-150 transition-colors sm:px-4">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 md:hidden">
            {showNavigation ? (
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((value) => !value)}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation"
                aria-label={isMobileMenuOpen ? "Cerrar menu" : "Abrir menu"}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${dockButtonClassName}`}
              >
                {isMobileMenuOpen ? <CloseIcon size={16} /> : <MenuIcon size={16} />}
              </button>
            ) : (
              <span className="h-9 w-9" aria-hidden="true" />
            )}

            <div className="flex justify-center">
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
                  className="h-auto w-[50px]"
                />
              </Link>
            </div>

            <Link
              href="/cart"
              aria-label="Carrito"
              className={`relative inline-flex h-9 w-9 items-center justify-center justify-self-end rounded-full border transition ${dockButtonClassName}`}
            >
              <CartIcon size={16} />
              <CartBadge totalItems={totals.totalItems} />
            </Link>
          </div>

          <div className="hidden items-center md:grid md:grid-cols-[auto_1fr_auto] md:gap-4">
            <div className="flex items-center justify-start">
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
                  className="h-auto w-[54px]"
                />
              </Link>
            </div>

            {showNavigation ? (
              <nav aria-label="Navegacion principal" className="flex justify-center">
                <div
                  className={`inline-flex items-center gap-1 rounded-[999px] border px-1.5 py-1.5 ${dockRailClassName}`}
                >
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-full px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.18em] transition ${
                        isItemActive(item.href)
                          ? "bg-white/[0.16] text-white shadow-[0_10px_24px_rgba(0,0,0,0.16)]"
                          : "text-white/60 hover:-translate-y-[1px] hover:bg-white/[0.07] hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </nav>
            ) : null}

            <div
              className={`inline-flex items-center justify-self-end gap-1 rounded-[999px] border px-1.5 py-1.5 ${dockRailClassName}`}
            >
              <Link
                href="/cart"
                aria-label="Carrito"
                className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${dockButtonClassName}`}
              >
                <CartIcon size={16} />
                <CartBadge totalItems={totals.totalItems} />
              </Link>

              <Link
                href={zoneHref}
                aria-label={selectedCity?.name ?? "Elegir zona"}
                className={`group/location relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${cityButtonClassName}`}
              >
                <LocationPinIcon size={14} className="shrink-0" />
                <span className="pointer-events-none absolute right-0 top-[calc(100%+0.55rem)] z-50 max-w-[14rem] translate-y-1 whitespace-nowrap rounded-full border border-white/14 bg-black/58 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white/82 opacity-0 shadow-[0_14px_36px_rgba(0,0,0,0.24)] backdrop-blur-xl backdrop-saturate-150 transition duration-200 group-hover/location:translate-y-0 group-hover/location:opacity-100 group-focus-visible/location:translate-y-0 group-focus-visible/location:opacity-100">
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
            <nav aria-label="Navegacion movil">
              <ul className="grid gap-2">
                <li>
                  <Link
                    href={zoneHref}
                    className={`flex items-center gap-3 rounded-[1rem] border px-4 py-3 text-sm font-medium transition ${cityButtonClassName}`}
                  >
                    <LocationPinIcon size={16} className="shrink-0" />
                    <span className="truncate">
                      {selectedCity?.name ?? "Elegir zona"}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cart"
                    className="flex items-center gap-3 rounded-[1rem] px-4 py-3 text-sm font-medium text-white/76 transition hover:bg-white/[0.05]"
                  >
                    <span className="relative inline-flex h-5 w-5 items-center justify-center">
                      <CartIcon size={18} />
                      <CartBadge totalItems={totals.totalItems} />
                    </span>
                    <span>Carrito</span>
                  </Link>
                </li>
                {navigationItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center rounded-[1rem] px-4 py-3 text-sm font-medium transition ${
                        isItemActive(item.href)
                          ? "bg-white/[0.08] text-white"
                          : "text-white/76 hover:bg-white/[0.05]"
                      }`}
                    >
                      {item.label}
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
