"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import { MapPinned, Menu, X } from "lucide-react";
import { CartIcon } from "@/components/icons/cart-icon";
import { useCart } from "@/features/cart/hooks/use-cart";

type DemoSiteHeaderProps = {
  currentCityName?: string | null;
  currentCitySlug?: string | null;
  isLightTheme: boolean;
};

type NavItem = {
  label: string;
  href: string;
};

function getBadgeLabel(totalItems: number) {
  return totalItems > 9 ? "9+" : String(totalItems);
}

function CartBadge({ totalItems }: { totalItems: number }) {
  if (totalItems <= 0) {
    return null;
  }

  return (
    <span className="absolute -right-1.5 -top-1.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#E5484D] px-1 text-[9px] font-semibold leading-none text-white shadow-[0_6px_16px_rgba(0,0,0,0.18)]">
      {getBadgeLabel(totalItems)}
    </span>
  );
}

const logoSrc = "/logo/ZyelnpickLOGO_green.png";

export function DemoSiteHeader({
  currentCityName = null,
  currentCitySlug = null,
  isLightTheme,
}: DemoSiteHeaderProps) {
  const pathname = usePathname();
  const { totals } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigationItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [
      { label: "Zonas", href: "/zonas" },
      { label: "Platos", href: "/platos" },
    ];

    if (currentCitySlug) {
      items.push({
        label: "Ciudad",
        href: `/zonas/${currentCitySlug}`,
      });
    }

    return items;
  }, [currentCitySlug]);

  const isItemActive = (href: string) => {
    if (href === "/demo") {
      return pathname === "/demo";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const shellClassName = isLightTheme
    ? "border-white/60 bg-white/58 text-[#181816] shadow-[0_18px_42px_rgba(20,20,20,0.08)]"
    : "border-white/16 bg-white/[0.10] text-white shadow-[0_20px_48px_rgba(0,0,0,0.22)]";

  const cityPillClassName = isLightTheme
    ? currentCitySlug
      ? "border-black/10 bg-white/45 text-[#181816] hover:bg-white/62"
      : "border-black/8 bg-black/[0.03] text-[#181816] hover:bg-black/[0.045]"
    : currentCitySlug
      ? "border-white/18 bg-white/[0.11] text-white hover:bg-white/[0.16]"
      : "border-white/16 bg-white/[0.09] text-white hover:bg-white/[0.15]";

  const iconButtonClassName = isLightTheme
    ? "border-black/8 bg-white/42 text-[#181816] hover:bg-white/62"
    : "border-white/16 bg-white/[0.09] text-white hover:bg-white/[0.15]";

  const desktopNavRailClassName = isLightTheme
    ? "border-white/55 bg-white/42 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
    : "border-white/16 bg-white/[0.10] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]";

  const desktopNavItemClassName = isLightTheme
    ? "text-[#181816]/62 hover:text-[#181816] hover:bg-black/[0.045] hover:-translate-y-[1px]"
    : "text-white/60 hover:text-white hover:bg-white/[0.07] hover:-translate-y-[1px]";

  const desktopNavItemActiveClassName = isLightTheme
    ? "bg-white/78 text-[#181816] shadow-[0_10px_24px_rgba(20,20,20,0.1)]"
    : "bg-white/[0.16] text-white shadow-[0_10px_24px_rgba(0,0,0,0.16)]";

  const desktopDockIconClassName = isLightTheme
    ? "border-black/8 bg-white/42 text-[#181816] hover:bg-white/62 hover:-translate-y-[1px]"
    : "border-white/16 bg-white/[0.09] text-white hover:bg-white/[0.15] hover:-translate-y-[1px]";

  const mobileNavItemClassName = isLightTheme
    ? "text-[#181816]/68 hover:bg-black/[0.04]"
    : "text-white/76 hover:bg-white/[0.05]";

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="relative mx-auto w-full max-w-7xl">
        <div
          className={`rounded-[1.55rem] border px-3.5 py-2 backdrop-blur-2xl backdrop-saturate-150 transition-colors sm:px-4 ${shellClassName}`}
        >
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="demo-mobile-navigation"
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${iconButtonClassName}`}
            >
              {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>

            <div className="flex justify-center">
              <Link
                href="/"
                className="inline-flex min-h-[20px] items-center justify-center"
              >
                <Image
                  src={logoSrc}
                  alt="ZylenPick"
                  width={210}
                  height={42}
                  priority
                  className="h-auto w-[44px] sm:w-[50px]"
                />
              </Link>
            </div>

            <Link
              href="/cart"
              aria-label="Carrito"
              className={`relative inline-flex h-9 w-9 items-center justify-center justify-self-end rounded-full border transition ${iconButtonClassName}`}
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
              >
                <Image
                  src={logoSrc}
                  alt="ZylenPick"
                  width={210}
                  height={42}
                  priority
                  className="h-auto w-[44px] sm:w-[50px]"
                />
              </Link>
            </div>

            <nav aria-label="Navegación principal" className="flex justify-center">
              <div
                className={`inline-flex items-center gap-1 rounded-[999px] border px-1.5 py-1.5 ${desktopNavRailClassName}`}
              >
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.18em] transition ${
                      isItemActive(item.href)
                        ? desktopNavItemActiveClassName
                        : desktopNavItemClassName
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>

            <div
              className={`inline-flex items-center justify-self-end gap-1 rounded-[999px] border px-1.5 py-1.5 ${desktopNavRailClassName}`}
            >
              <Link
                href="/cart"
                aria-label="Carrito"
                className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${desktopDockIconClassName}`}
              >
                <CartIcon size={16} />
                <CartBadge totalItems={totals.totalItems} />
              </Link>

              <Link
                href={currentCitySlug ? `/zonas/${currentCitySlug}` : "/zonas"}
                aria-label={currentCityName ?? "Zona"}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${cityPillClassName}`}
              >
                <MapPinned size={13} className="shrink-0" />
              </Link>
            </div>
          </div>
        </div>

        {isMobileMenuOpen ? (
          <div
            id="demo-mobile-navigation"
            className={`absolute inset-x-0 top-[calc(100%+0.7rem)] z-50 rounded-[1.35rem] border p-3 backdrop-blur-2xl backdrop-saturate-150 md:hidden ${shellClassName}`}
          >
            <nav aria-label="Navegación móvil">
              <ul className="grid gap-2">
                <li>
                  <Link
                    href="/cart"
                    className={`flex items-center gap-3 rounded-[1rem] px-4 py-3 text-sm font-medium transition ${
                      isLightTheme
                        ? "text-[#181816]/68 hover:bg-black/[0.04]"
                        : "text-white/76 hover:bg-white/[0.05]"
                    }`}
                  >
                    <span className="relative inline-flex h-5 w-5 items-center justify-center">
                      <CartIcon size={18} />
                      <CartBadge totalItems={totals.totalItems} />
                    </span>
                    <span>Carrito</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={currentCitySlug ? `/zonas/${currentCitySlug}` : "/zonas"}
                    className={`flex items-center gap-2 rounded-[1rem] border px-4 py-3 text-sm font-medium transition ${cityPillClassName}`}
                  >
                    <MapPinned size={16} className="text-[color:var(--accent)]" />
                    <span className="truncate">{currentCityName ?? "Zona"}</span>
                  </Link>
                </li>
                {navigationItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center rounded-[1rem] px-4 py-3 text-sm font-medium transition ${
                        isItemActive(item.href)
                          ? isLightTheme
                            ? "bg-white text-[#181816]"
                            : "bg-white/[0.08] text-white"
                          : mobileNavItemClassName
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
