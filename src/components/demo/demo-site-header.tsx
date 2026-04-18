"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import { MapPinned, Menu, Moon, Sun, X } from "lucide-react";
import { CartIcon } from "@/components/icons/cart-icon";
import { useCart } from "@/features/cart/hooks/use-cart";

type DemoSiteHeaderProps = {
  currentCityName?: string | null;
  currentCitySlug?: string | null;
  isLightTheme: boolean;
  onToggleTheme: () => void;
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
  onToggleTheme,
}: DemoSiteHeaderProps) {
  const pathname = usePathname();
  const { totals } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isZonesRoute =
    pathname === "/zonas" ||
    pathname.startsWith("/zonas/") ||
    pathname === "/demo/zonas" ||
    pathname.startsWith("/demo/zonas/");

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
    ? isZonesRoute
      ? "border-black/8 bg-[linear-gradient(180deg,rgba(248,242,231,0.95),rgba(242,235,224,0.88))] text-[#181816] shadow-[0_22px_48px_rgba(20,20,20,0.08)]"
      : "border-black/8 bg-[#f5efe4]/76 text-[#181816] shadow-[0_16px_36px_rgba(20,20,20,0.05)]"
    : isZonesRoute
      ? "border-white/10 bg-[linear-gradient(180deg,rgba(8,18,24,0.9),rgba(6,14,20,0.82))] text-white shadow-[0_24px_54px_rgba(0,0,0,0.26)]"
      : "border-white/10 bg-[#071611]/70 text-white shadow-[0_16px_36px_rgba(0,0,0,0.18)]";

  const cityPillClassName = isLightTheme
    ? currentCitySlug
      ? "border-[#168453]/18 bg-[#168453]/10 text-[#168453] hover:bg-[#168453]/16"
      : "border-black/8 bg-black/[0.03] text-[#181816] hover:bg-black/[0.045]"
    : currentCitySlug
      ? "border-[#7cffb8]/18 bg-[#7cffb8]/10 text-[#7cffb8] hover:bg-[#7cffb8]/16"
      : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]";

  const iconButtonClassName = isLightTheme
    ? "border-black/8 bg-black/[0.03] text-[#181816] hover:bg-black/[0.045]"
    : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]";

  const desktopNavRailClassName = isLightTheme
    ? isZonesRoute
      ? "border-black/8 bg-black/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]"
      : "border-black/8 bg-black/[0.02]"
    : isZonesRoute
      ? "border-white/10 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
      : "border-white/10 bg-white/[0.03]";

  const desktopNavItemClassName = isLightTheme
    ? "text-[#181816]/62 hover:text-[#181816] hover:bg-black/[0.045] hover:-translate-y-[1px]"
    : "text-white/60 hover:text-white hover:bg-white/[0.07] hover:-translate-y-[1px]";

  const desktopNavItemActiveClassName = isLightTheme
    ? "bg-white text-[#181816] shadow-[0_10px_24px_rgba(20,20,20,0.1)]"
    : "bg-[#7cffb8]/12 text-white shadow-[0_10px_24px_rgba(0,0,0,0.2)]";

  const desktopDockIconClassName = isLightTheme
    ? "border-black/8 bg-black/[0.03] text-[#181816] hover:bg-black/[0.05] hover:-translate-y-[1px]"
    : isZonesRoute
      ? "border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1] hover:-translate-y-[1px]"
      : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07] hover:-translate-y-[1px]";

  const mobileNavItemClassName = isLightTheme
    ? "text-[#181816]/68 hover:bg-black/[0.04]"
    : "text-white/76 hover:bg-white/[0.05]";

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="relative mx-auto w-full max-w-7xl">
        <div
          className={`rounded-[1.55rem] border px-3.5 py-2 backdrop-blur-2xl transition-colors sm:px-4 ${shellClassName}`}
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

            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isLightTheme ? "Cambiar a oscuro" : "Cambiar a claro"}
              className={`inline-flex h-9 w-9 items-center justify-center justify-self-end rounded-full border transition ${iconButtonClassName}`}
            >
              {isLightTheme ? <Moon size={14} /> : <Sun size={14} />}
            </button>
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

              <button
                type="button"
                onClick={onToggleTheme}
                aria-label={isLightTheme ? "Cambiar a oscuro" : "Cambiar a claro"}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${desktopDockIconClassName}`}
              >
                {isLightTheme ? <Moon size={13} /> : <Sun size={13} />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen ? (
          <div
            id="demo-mobile-navigation"
            className={`absolute inset-x-0 top-[calc(100%+0.7rem)] z-50 rounded-[1.35rem] border p-3 backdrop-blur-2xl md:hidden ${shellClassName}`}
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
