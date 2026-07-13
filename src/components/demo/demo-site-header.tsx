"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import { BookOpen, LayoutGrid, MapPinned, Menu, ReceiptText, Store, X } from "lucide-react";
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
  { label: "Explorar selecci\u00f3n", href: "/platos" },
  { label: "Zonas", href: "/zonas" },
  { label: "Tu cesta", href: "/cart" },
  { label: "\u00danete", href: "/unete" },
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

const logoSrc = "/logo/LogoNuevo_Negativo.svg";

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
      { label: "Selecci\u00f3n", href: "/platos", Icon: LayoutGrid },
      { label: "Zonas", href: "/zonas", Icon: MapPinned },
      { label: "\u00danete", href: "/unete", Icon: Store },
    ],
    [],
  );

  const isItemActive = (href: string) => {
    if (href === "/demo") {
      return pathname === "/demo";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };
  const headerLogoSrc = isLightTheme ? "/logo/LogoNuevo.svg" : logoSrc;
  const dockLogoSrc = "/logo/LogoNuevo.svg";

  const shellClassName = isLightTheme
    ? "border-[#741314]/14 bg-[#FFF7E8]/80 text-[#741314] shadow-[0_18px_42px_rgba(116,19,20,0.08)]"
    : "border-[#741314]/14 bg-[#FFF7E8]/80 text-[#741314] shadow-[0_18px_42px_rgba(116,19,20,0.08)]";

  const iconButtonClassName = isLightTheme
    ? "border-[#741314]/14 bg-[#FFF7E8]/80 text-[#741314] hover:border-[#741314]/32 hover:bg-[#741314] hover:text-[#FDE3AD]"
    : "border-[#741314]/14 bg-[#FFF7E8]/80 text-[#741314] hover:border-[#741314]/32 hover:bg-[#741314] hover:text-[#FDE3AD]";
  const cartButtonClassName =
    totals.totalItems > 0
      ? "border-[#FED47D]/28 bg-[#FED47D]/10 text-[#FED47D] hover:bg-[#FED47D]/16"
      : iconButtonClassName;

  const desktopNavRailClassName = isLightTheme
    ? "border border-[#741314]/14 bg-[#FFF7E8]/80 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.76),0_12px_28px_rgba(116,19,20,0.08)] backdrop-blur-xl backdrop-saturate-150"
    : "border border-[#741314]/14 bg-[#FFF7E8]/80 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.76),0_12px_28px_rgba(116,19,20,0.08)] backdrop-blur-xl backdrop-saturate-150";

  const desktopNavItemClassName = isLightTheme
    ? "border-transparent text-[#741314]/72 hover:-translate-y-[1px] hover:bg-[#741314]/10 hover:text-[#741314]"
    : "border-transparent text-[#741314]/72 hover:-translate-y-[1px] hover:bg-[#741314]/10 hover:text-[#741314]";

  const desktopNavItemActiveClassName = isLightTheme
    ? "border-[#741314] bg-[#741314] text-[#FDE3AD] shadow-[0_10px_24px_rgba(116,19,20,0.18)]"
    : "border-[#741314] bg-[#741314] text-[#FDE3AD] shadow-[0_10px_28px_rgba(116,19,20,0.22)]";

  const desktopDockIconClassName = isLightTheme
    ? "border-[#741314]/14 bg-[#FFF7E8]/80 text-[#741314] hover:border-[#741314]/32 hover:bg-[#741314] hover:text-[#FDE3AD]"
    : "border-[#741314]/14 bg-[#FFF7E8]/80 text-[#741314] hover:border-[#741314]/32 hover:bg-[#741314] hover:text-[#FDE3AD]";
  const desktopCartButtonClassName =
    totals.totalItems > 0
      ? "border-[#FED47D]/28 bg-[#FED47D]/10 text-[#FED47D] hover:bg-[#FED47D]/16"
      : desktopDockIconClassName;
  const desktopLeftDockItems = [
    navigationItems[0],
    navigationItems[1],
    { label: "Proyecto", href: "/el-proyecto", Icon: BookOpen },
  ];
  const desktopRightDockItems = [
    navigationItems[2],
    { label: "Pedidos", href: "/pedidos", Icon: ReceiptText },
  ];

  const mobileNavItemClassName = isLightTheme
    ? "text-[#181816]/68 hover:bg-black/[0.04]"
    : "text-white/76 hover:bg-white/[0.05]";

  return (
    <header className="sticky top-[max(0.7rem,env(safe-area-inset-top))] z-40 px-3 sm:px-6 lg:px-8">
      <div className="relative mx-auto w-full max-w-7xl">
        <div
          className={
            isLightTheme
              ? "rounded-full border border-[#741314]/14 bg-[#FFF7E8]/80 px-2 py-1.5 text-[#741314] shadow-[0_10px_30px_rgba(116,19,20,0.08)] backdrop-blur-xl backdrop-saturate-150 sm:px-2.5 md:mx-auto md:w-fit md:border-transparent md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none"
              : "rounded-full border border-[#741314]/14 bg-[#FFF7E8]/80 px-2 py-1.5 text-[#741314] shadow-[0_10px_30px_rgba(116,19,20,0.08)] backdrop-blur-xl backdrop-saturate-150 sm:px-2.5 md:mx-auto md:w-fit md:border-transparent md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none"
          }
        >
          <div className="flex items-center justify-center gap-1.5 md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="demo-mobile-navigation"
              aria-label={isMobileMenuOpen ? "Cerrar men\u00fa" : "Abrir men\u00fa"}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${iconButtonClassName}`}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link
              href="/platos"
              aria-label="Explorar selección"
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                isItemActive("/platos")
                  ? desktopNavItemActiveClassName
                  : iconButtonClassName
              }`}
            >
              <LayoutGrid size={22} strokeWidth={2.05} />
            </Link>

            <Link
              href="/"
              className="inline-flex h-9 min-w-[5.45rem] items-center justify-center rounded-full px-2 transition hover:bg-[#741314]/8"
              aria-label="Ir al inicio"
            >
              <Image
                src={dockLogoSrc}
                alt="Pickyalo"
                width={210}
                height={42}
                priority
                className="h-auto w-[82px]"
              />
            </Link>

            <Link
              href={currentCitySlug ? `/zonas/${currentCitySlug}` : "/zonas"}
              aria-label={currentCityName ? `Ver ${currentCityName}` : "Ver zonas"}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                isItemActive("/zonas")
                  ? desktopNavItemActiveClassName
                  : iconButtonClassName
              }`}
            >
              <MapPinned size={22} strokeWidth={2.05} />
            </Link>

            <Link
              href="/cart"
              aria-label="Tu cesta"
              className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${cartButtonClassName}`}
            >
              <CartIcon size={22} />
              <CartBadge totalItems={totals.totalItems} />
            </Link>
          </div>

          <div className="hidden items-center justify-center md:flex">
            <nav
              aria-label="Navegacion principal"
              className={`inline-flex items-center gap-1.5 rounded-[1.7rem] ${desktopNavRailClassName}`}
            >
              {desktopLeftDockItems.map((item) => {
                const Icon = item.Icon;
                const href = item.href === "/zonas" && currentCitySlug ? `/zonas/${currentCitySlug}` : item.href;
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
                className="inline-flex h-14 min-w-[8.75rem] items-center justify-center rounded-[1.25rem] px-3 transition hover:bg-black/[0.045]"
                aria-label="Ir al inicio"
              >
                <Image
                  src={headerLogoSrc}
                  alt="Pickyalo"
                  width={210}
                  height={42}
                  priority
                  className="h-auto w-[108px]"
                />
              </Link>

              {desktopRightDockItems.map((item) => {
                const Icon = item.Icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
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
            <nav aria-label="Navegacion movil">
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





