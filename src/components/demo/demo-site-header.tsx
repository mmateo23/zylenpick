"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

const mobileNavigationItems: NavItem[] = [
  { label: "Explorar selección", href: "/platos" },
  { label: "Zonas", href: "/zonas" },
  { label: "Tu cesta", href: "/cart" },
  { label: "Únete", href: "/unete" },
  { label: "El proyecto", href: "/el-proyecto" },
];

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

const logoSrc = "/logo/Pickyalo_Logo_Vanilla.svg";
const rotatingCategoryLabels = ["#PLATOS", "#CAFÉS", "#HELADOS", "#TACOS"];

export function DemoSiteHeader({
  currentCityName = null,
  currentCitySlug = null,
  isLightTheme,
}: DemoSiteHeaderProps) {
  const pathname = usePathname();
  const { totals } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const navigationItems = useMemo<NavItem[]>(
    () => [
      { label: "Selección", href: "/platos" },
      { label: "Zonas", href: "/zonas" },
      { label: "Únete", href: "/unete" },
    ],
    [],
  );

  const isItemActive = (href: string) => {
    if (href === "/demo") {
      return pathname === "/demo";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };
  const activeCategoryLabel = rotatingCategoryLabels[activeCategoryIndex];
  const headerLogoSrc = isLightTheme ? "/logo/Pickyalo_Logo_Black.svg" : logoSrc;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveCategoryIndex(
        (currentIndex) => (currentIndex + 1) % rotatingCategoryLabels.length,
      );
    }, 2200);

    return () => window.clearInterval(intervalId);
  }, []);

  const shellClassName = isLightTheme
    ? "border-white/60 bg-white/58 text-[#181816] shadow-[0_18px_42px_rgba(20,20,20,0.08)]"
    : "border-white/16 bg-white/[0.10] text-white shadow-[0_20px_48px_rgba(0,0,0,0.22)]";

  const cityPillClassName = isLightTheme
    ? currentCitySlug
      ? "border-[#FED47D]/45 bg-[#FED47D]/18 text-[#3A2119] shadow-[0_18px_42px_rgba(254,212,125,0.16)] hover:bg-[#FED47D]/24"
      : "border-black/8 bg-black/[0.03] text-[#181816] hover:bg-black/[0.045]"
    : currentCitySlug
      ? "border-[#FED47D]/45 bg-[#FED47D]/18 text-[#3A2119] shadow-[0_18px_42px_rgba(254,212,125,0.16)] hover:bg-[#FED47D]/24"
      : "border-white/16 bg-white/[0.09] text-white hover:bg-white/[0.15]";

  const iconButtonClassName = isLightTheme
    ? "border-transparent bg-transparent text-[#181816]/76 hover:bg-black/[0.045] hover:text-[#181816]"
    : "border-transparent bg-transparent text-white/82 hover:bg-white/[0.075] hover:text-white";
  const cartButtonClassName =
    totals.totalItems > 0
      ? "border-[#FED47D]/28 bg-[#FED47D]/10 text-[#FED47D] hover:bg-[#FED47D]/16"
      : iconButtonClassName;

  const desktopNavRailClassName = isLightTheme
    ? "bg-transparent"
    : "bg-transparent";

  const desktopNavItemClassName = isLightTheme
    ? "text-[#181816]/66 hover:text-[#181816] hover:bg-black/[0.045] hover:-translate-y-[1px]"
    : "text-white/68 hover:text-white hover:bg-white/[0.07] hover:-translate-y-[1px]";

  const desktopNavItemActiveClassName = isLightTheme
    ? "bg-[#FED47D] font-bold text-[#2A120D] shadow-[0_10px_28px_rgba(254,212,125,0.22)]"
    : "bg-[#FED47D] font-bold text-[#2A120D] shadow-[0_10px_30px_rgba(254,212,125,0.26)]";

  const desktopDockIconClassName = isLightTheme
    ? "border-transparent bg-transparent text-[#181816]/76 hover:bg-black/[0.045] hover:text-[#181816]"
    : "border-transparent bg-transparent text-white/82 hover:bg-white/[0.075] hover:text-white";
  const desktopCartButtonClassName =
    totals.totalItems > 0
      ? "border-[#FED47D]/28 bg-[#FED47D]/10 text-[#FED47D] hover:bg-[#FED47D]/16"
      : desktopDockIconClassName;

  const mobileNavItemClassName = isLightTheme
    ? "text-[#181816]/68 hover:bg-black/[0.04]"
    : "text-white/76 hover:bg-white/[0.05]";

  return (
    <header className="sticky top-[max(0.7rem,env(safe-area-inset-top))] z-40 px-3 sm:px-6 lg:px-8">
      <div className="relative mx-auto w-full max-w-7xl">
        <div
          className={
            isLightTheme
              ? "rounded-full border border-black/8 bg-white/50 px-2 py-1.5 text-[#181816] shadow-[0_10px_30px_rgba(20,20,20,0.08)] backdrop-blur-xl backdrop-saturate-150 sm:px-2.5"
              : "rounded-full border border-white/10 bg-[#160f0c]/42 px-2 py-1.5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl backdrop-saturate-150 sm:px-2.5"
          }
        >
          <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="demo-mobile-navigation"
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${iconButtonClassName}`}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div className="flex min-w-0 flex-col items-center justify-center gap-0.5">
              <Link
                href="/"
                className="inline-flex min-h-[20px] items-center justify-center"
              >
                <Image
                  src={headerLogoSrc}
                  alt="Pickyalo"
                  width={210}
                  height={42}
                  priority
                  className="h-auto w-[78px] sm:w-[86px]"
                />
              </Link>
              <span
                key={activeCategoryLabel}
                className="block h-3 text-[9px] font-black leading-none tracking-[0.14em] text-[#FED47D]"
              >
                {activeCategoryLabel}
              </span>
            </div>

            <Link
              href="/cart"
              aria-label="Tu cesta"
              className={`relative inline-flex h-9 w-9 items-center justify-center justify-self-end rounded-full border transition ${cartButtonClassName}`}
            >
              <CartIcon size={22} />
              <CartBadge totalItems={totals.totalItems} />
            </Link>
          </div>

          <div className="hidden items-center md:grid md:grid-cols-[auto_1fr_auto] md:gap-4">
            <div className="flex items-center justify-start gap-2.5">
              <Link
                href="/"
                className="inline-flex min-h-[22px] items-center justify-center px-1.5 transition hover:opacity-85"
              >
                <Image
                  src={headerLogoSrc}
                  alt="Pickyalo"
                  width={210}
                  height={42}
                  priority
                  className="h-auto w-[106px]"
                />
              </Link>
              <span
                key={activeCategoryLabel}
                className="inline-flex h-7 min-w-[5.6rem] items-center justify-center rounded-full border border-[#FED47D]/22 bg-[#FED47D]/10 px-2.5 text-[10px] font-black leading-none tracking-[0.16em] text-[#FED47D]"
              >
                {activeCategoryLabel}
              </span>
            </div>

            <nav aria-label="Navegación principal" className="flex justify-center">
              <div
                className={`inline-flex items-center gap-0.5 rounded-full ${desktopNavRailClassName}`}
              >
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold tracking-normal transition ${
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

            <div className="inline-flex items-center justify-self-end gap-2">
              <Link
                href="/cart"
                aria-label="Tu cesta"
                className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${desktopCartButtonClassName}`}
              >
                <CartIcon size={22} />
                <CartBadge totalItems={totals.totalItems} />
              </Link>

              <Link
                href={currentCitySlug ? `/zonas/${currentCitySlug}` : "/zonas"}
                aria-label={currentCityName ?? "Zona"}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${cityPillClassName}`}
              >
                <MapPinned size={22} className="shrink-0" />
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
                {mobileNavigationItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-[1rem] px-4 py-3 text-sm font-medium transition ${
                        isItemActive(item.href)
                          ? isLightTheme
                            ? "bg-white text-[#181816]"
                            : "bg-white/[0.08] text-white"
                          : mobileNavItemClassName
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
                          className={currentCitySlug ? "shrink-0 text-[#FED47D]" : "shrink-0"}
                        />
                      ) : null}
                      <span className="truncate">{item.label}</span>
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





