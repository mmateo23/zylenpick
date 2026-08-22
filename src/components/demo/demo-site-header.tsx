"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import { Info, LayoutGrid, Map, MapPinned, Menu, ReceiptText, Store, X } from "lucide-react";
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
  Icon?: typeof LayoutGrid;
};

const mobileNavigationItems: NavItem[] = [
  { label: "Explorar mapa", href: "/mapa" },
  { label: "Explorar platos", href: "/platos" },
  { label: "Zonas", href: "/zonas" },
  { label: "Tu cesta", href: "/cart" },
  { label: "Pedidos", href: "/pedidos" },
  { label: "\u00danete", href: "/unete" },
  { label: "El proyecto", href: "/el-proyecto" },
];

const mapDiscoveryHref = "/mapa?localizar=1";

function getNavigationHref(href: string) {
  return href === "/mapa" ? mapDiscoveryHref : href;
}

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

export function DemoSiteHeader({
  currentCityName = null,
  currentCitySlug = null,
  isLightTheme,
}: DemoSiteHeaderProps) {
  const pathname = usePathname();
  const { totals } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigationItems = useMemo<NavItem[]>(
    () => [
      { label: "Mapa", href: "/mapa", Icon: Map },
      { label: "Platos", href: "/platos", Icon: LayoutGrid },
      { label: "Zonas", href: "/zonas", Icon: MapPinned },
    ],
    [],
  );

  const isItemActive = (href: string) => {
    if (href === "/demo") {
      return pathname === "/demo";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };
  const dockLogoSrc = "/icons/pickyalo-app.svg";
  const mobileDockLogoSrc = "/icons/pickyalo-app.svg";

  const shellClassName = isLightTheme
    ? "border-[#741314]/14 bg-[#FFF7E8]/80 text-[#741314] shadow-[0_18px_42px_rgba(116,19,20,0.08)]"
    : "border-[#741314]/14 bg-[#FFF7E8]/80 text-[#741314] shadow-[0_18px_42px_rgba(116,19,20,0.08)]";

  const iconButtonClassName = isLightTheme
    ? "border-transparent bg-transparent text-[#741314] hover:border-[#741314]/18 hover:bg-[#741314]/10"
    : "border-transparent bg-transparent text-[#741314] hover:border-[#741314]/18 hover:bg-[#741314]/10";
  const cartButtonClassName =
    totals.totalItems > 0
      ? "border-[#741314] bg-[#741314] text-[#FDE3AD] shadow-[0_8px_20px_rgba(116,19,20,0.2)]"
      : iconButtonClassName;

  const desktopNavRailClassName = isLightTheme
    ? "border border-[var(--floating-surface-border)] bg-[var(--floating-surface)] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.90),0_12px_30px_rgba(56,25,50,0.14)] backdrop-blur-xl backdrop-saturate-150"
    : "border border-[var(--floating-surface-border)] bg-[var(--floating-surface)] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.90),0_12px_30px_rgba(56,25,50,0.14)] backdrop-blur-xl backdrop-saturate-150";

  const desktopNavItemClassName = isLightTheme
    ? "border-transparent text-[#741314] hover:-translate-y-[1px] hover:bg-[#741314]/10"
    : "border-transparent text-[#741314] hover:-translate-y-[1px] hover:bg-[#741314]/10";

  const desktopNavItemActiveClassName = isLightTheme
    ? "border-[#741314] bg-[#741314] text-[#FDE3AD] shadow-[0_10px_24px_rgba(116,19,20,0.18)]"
    : "border-[#741314] bg-[#741314] text-[#FDE3AD] shadow-[0_10px_28px_rgba(116,19,20,0.22)]";

  const desktopDockIconClassName = isLightTheme
    ? "border-transparent bg-transparent text-[#741314] hover:border-[#741314]/18 hover:bg-[#741314]/10"
    : "border-transparent bg-transparent text-[#741314] hover:border-[#741314]/18 hover:bg-[#741314]/10";
  const desktopCartButtonClassName =
    totals.totalItems > 0
      ? "border-[#741314] bg-[#741314] text-[#FDE3AD] shadow-[0_8px_20px_rgba(116,19,20,0.2)]"
      : desktopDockIconClassName;
  const desktopLeftDockItems = [
    navigationItems[0],
    navigationItems[1],
  ];
  const desktopRightDockItems = [
    navigationItems[2],
  ];

  const mobileNavItemClassName = isLightTheme
    ? "text-[#181816]/68 hover:bg-black/[0.04]"
    : "text-white/76 hover:bg-white/[0.05]";

  return (
    <header className="sticky top-[max(0.7rem,env(safe-area-inset-top))] z-40 px-3 sm:px-6 lg:px-8">
      <div className="relative mx-auto w-full max-w-7xl">
        <div className="pickyalo-floating-surface mx-auto w-fit rounded-full border px-2 py-1.5 md:border-transparent md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none">
          <div className="grid grid-cols-[repeat(5,2.75rem)] items-center justify-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="demo-mobile-navigation"
              aria-label={isMobileMenuOpen ? "Cerrar men\u00fa" : "Abrir men\u00fa"}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${iconButtonClassName}`}
            >
              {isMobileMenuOpen ? <X size={25} /> : <Menu size={25} />}
            </button>

            <Link
              href={mapDiscoveryHref}
              aria-label="Explorar mapa"
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
                isItemActive("/mapa")
                  ? desktopNavItemActiveClassName
                  : iconButtonClassName
              }`}
            >
              <Map size={26} strokeWidth={2.05} />
            </Link>

            <Link
              href="/"
              className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-[0.9rem] transition hover:opacity-90"
              aria-label="Ir al inicio"
            >
              <Image
                src={mobileDockLogoSrc}
                alt="Pickyalo"
                width={44}
                height={44}
                priority
                className="h-11 w-11 object-cover"
              />
            </Link>

            <Link
              href="/platos"
              aria-label="Explorar platos"
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
                isItemActive("/platos")
                  ? desktopNavItemActiveClassName
                  : iconButtonClassName
              }`}
            >
              <LayoutGrid size={26} strokeWidth={2.05} />
            </Link>

            <Link
              href="/cart"
              aria-label="Tu cesta"
              className={`relative inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${cartButtonClassName}`}
            >
              <CartIcon size={25} />
              <CartBadge totalItems={totals.totalItems} />
            </Link>
          </div>

          <div className="hidden items-center justify-center md:flex">
            <nav
              aria-label="Navegación principal"
              className={`inline-flex items-center gap-1.5 rounded-[1.7rem] ${desktopNavRailClassName}`}
            >
              {desktopLeftDockItems.map((item) => {
                const Icon = item.Icon;
                const href = item.href === "/zonas" && currentCitySlug
                  ? `/zonas/${currentCitySlug}`
                  : getNavigationHref(item.href);
                const label =
                  item.href === "/zonas" && currentCityName ? currentCityName : item.label;

                return (
                  <Link
                    key={item.href}
                    href={href}
                    aria-label={label}
                    title={label}
                    className={`group/nav relative inline-flex h-14 w-[4.35rem] flex-col items-center justify-center gap-1 rounded-[1.25rem] border outline-none transition duration-200 ${
                      isItemActive(item.href)
                        ? desktopNavItemActiveClassName
                        : desktopNavItemClassName
                    }`}
                  >
                    {Icon ? <Icon size={24} strokeWidth={2.05} /> : null}
                    <span className="max-w-full truncate px-1 text-[10px] font-semibold leading-none tracking-[-0.01em]">
                      {label}
                    </span>
                  </Link>
                );
              })}

              <Link
                href="/"
                className="inline-flex h-14 w-14 items-center justify-center rounded-[1.25rem] transition hover:bg-black/[0.045]"
                aria-label="Ir al inicio"
              >
                <Image
                  src={dockLogoSrc}
                  alt="Pickyalo"
                  width={56}
                  height={56}
                  priority
                  className="h-12 w-12 rounded-[0.9rem] object-cover"
                />
              </Link>

              {desktopRightDockItems.map((item) => {
                const Icon = item.Icon;
                const href = item.href === "/zonas" && currentCitySlug
                  ? `/zonas/${currentCitySlug}`
                  : item.href;

                return (
                  <Link
                    key={item.href}
                    href={href}
                    aria-label={item.label}
                    title={item.label}
                    className={`group/nav relative inline-flex h-14 w-[4.35rem] flex-col items-center justify-center gap-1 rounded-[1.25rem] border outline-none transition duration-200 ${
                      isItemActive(item.href)
                        ? desktopNavItemActiveClassName
                        : desktopNavItemClassName
                    }`}
                  >
                    {Icon ? <Icon size={24} strokeWidth={2.05} /> : null}
                    <span className="max-w-full truncate px-1 text-[10px] font-semibold leading-none tracking-[-0.01em]">
                      {item.label}
                    </span>
                  </Link>
                );
              })}

              <Link
                href="/cart"
                aria-label="Tu cesta"
                title="Tu cesta"
                className={`relative inline-flex h-14 w-[4.35rem] flex-col items-center justify-center gap-1 rounded-[1.25rem] border transition ${desktopCartButtonClassName}`}
              >
                <CartIcon size={24} />
                <CartBadge totalItems={totals.totalItems} />
                <span className="max-w-full truncate px-1 text-[10px] font-semibold leading-none tracking-[-0.01em]">
                  Cesta
                </span>
              </Link>
            </nav>
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
                      href={getNavigationHref(item.href)}
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





