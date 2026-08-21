"use client";

import {
  Building2,
  Camera,
  Inbox,
  Layers3,
  LayoutDashboard,
  MapPinned,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { label: "Inicio", href: "/panel", icon: LayoutDashboard, matches: [] },
  { label: "Scout", href: "/panel/scout", icon: Camera, matches: [] },
  { label: "Locales", href: "/panel/locales", icon: Building2, matches: [] },
  { label: "Lugares", href: "/panel/lugares", icon: MapPinned, matches: [] },
  {
    label: "Contenido",
    href: "/panel/contenido",
    icon: Layers3,
    matches: ["/panel/destacados", "/panel/chips", "/panel/imagenes", "/panel/funnel"],
  },
  { label: "Solicitudes", href: "/panel/solicitudes", icon: Inbox, matches: [] },
  {
    label: "Ajustes",
    href: "/panel/ajustes",
    icon: Settings2,
    matches: ["/panel/diseno", "/panel/monetizacion"],
  },
];

function isItemActive(pathname: string, href: string, matches: string[]) {
  if (href === "/panel") {
    return pathname === href;
  }

  return pathname.startsWith(href) || matches.some((match) => pathname.startsWith(match));
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full min-w-0 rounded-[1.35rem] border border-[#741314]/12 bg-[#FFF7E8] p-3 shadow-[0_18px_55px_rgba(116,19,20,0.08)] lg:sticky lg:top-5 lg:h-[calc(100svh-2.5rem)] lg:p-4">
      <div className="flex items-center justify-between gap-3 px-2 py-2 lg:block lg:px-3 lg:pb-5 lg:pt-3">
        <Link
          href="/panel"
          className="font-pickyalo-wordmark text-2xl font-bold tracking-[-0.04em] text-[#741314] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2"
        >
          Pickyalo
        </Link>
        <span className="rounded-full border border-[#741314]/16 bg-[#741314]/[0.06] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#741314]/70">
          Gestión
        </span>
      </div>

      <nav aria-label="Navegación del panel" className="mt-2 min-w-0 lg:mt-0">
        <ul className="grid grid-cols-4 gap-1.5 sm:grid-cols-7 lg:block lg:space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(pathname, item.href, item.matches);

            return (
              <li key={item.href} className="min-w-0">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-[0.85rem] border px-2 py-2.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2 lg:justify-start lg:gap-2.5 lg:px-3 lg:text-sm ${
                    active
                      ? "border-[#741314] bg-[#741314] text-[#FFF7E8] shadow-[0_8px_22px_rgba(116,19,20,0.16)]"
                      : "border-transparent text-[#741314]/68 hover:border-[#741314]/12 hover:bg-[#741314]/[0.05] hover:text-[#741314]"
                  }`}
                >
                  <Icon aria-hidden="true" className="h-[1.1rem] w-[1.1rem] shrink-0" strokeWidth={2} />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-5 hidden border-t border-[#741314]/10 px-3 pt-4 lg:block">
        <Link
          href="/"
          className="text-xs font-semibold text-[#741314]/55 underline decoration-[#741314]/20 underline-offset-4 transition hover:text-[#741314]"
        >
          Ver web pública
        </Link>
      </div>
    </aside>
  );
}
