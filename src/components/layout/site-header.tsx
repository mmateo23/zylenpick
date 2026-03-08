"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/branding/logo";
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
  { label: "Inicio", href: "/" },
  { label: "Zonas", href: "/cities" },
  { label: "Carrito", href: "/cart" },
];

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
    <span className="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#E5484D] px-1.5 text-[10px] font-semibold leading-none text-white shadow-[var(--card-shadow)]">
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

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="relative mx-auto w-full max-w-7xl">
        <div className="flex items-center justify-between gap-4 rounded-[1.8rem] border border-white/10 bg-[color:var(--surface-dark)]/94 px-5 py-4 text-white shadow-[var(--soft-shadow)] backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Link href="/" className="flex shrink-0 items-center gap-4">
              <Logo
                priority
                mode="full"
                iconClassName="h-7 w-auto sm:h-8"
                textClassName="text-xl font-semibold text-white"
              />
            </Link>

            <Link
              href="/cities"
              className="inline-flex min-w-0 items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:bg-white/8 hover:text-white"
            >
              <LocationPinIcon
                size={17}
                className="shrink-0 text-[color:var(--accent)]"
              />
              <span className="max-w-[8rem] truncate sm:max-w-[14rem]">
                {selectedCity?.name ?? "Elegir zona"}
              </span>
            </Link>
          </div>

          {showNavigation ? (
            <>
              <nav aria-label="Navegación principal" className="hidden md:block">
                <ul className="flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1.5">
                  {navigationItems.map((item) => {
                    const isCartLink = item.href === "/cart";

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="inline-flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium text-white/76 transition hover:bg-white/10 hover:text-white"
                        >
                          {isCartLink ? (
                            <span className="relative inline-flex h-5 w-5 items-center justify-center">
                              <CartIcon size={18} />
                              <CartBadge totalItems={totals.totalItems} />
                            </span>
                          ) : null}
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((currentValue) => !currentValue)}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation"
                aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 md:hidden"
              >
                {isMobileMenuOpen ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
              </button>
            </>
          ) : null}
        </div>

        {showNavigation && isMobileMenuOpen ? (
          <div
            id="mobile-navigation"
            className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(18rem,calc(100vw-2rem))] rounded-[1.6rem] border border-white/10 bg-[color:var(--surface-dark)]/98 p-3 text-white shadow-[var(--shadow)] backdrop-blur"
          >
            <nav aria-label="Navegación móvil">
              <ul className="grid gap-2">
                {navigationItems.map((item) => {
                  const isCartLink = item.href === "/cart";

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 rounded-[1rem] px-4 py-3 text-sm font-medium text-white/76 transition hover:bg-white/8 hover:text-white"
                      >
                        {isCartLink ? (
                          <span className="relative inline-flex h-5 w-5 items-center justify-center">
                            <CartIcon size={18} />
                            <CartBadge totalItems={totals.totalItems} />
                          </span>
                        ) : null}
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
