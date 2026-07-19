"use client";

import {
  BadgeEuro,
  Building2,
  FileImage,
  Inbox,
  LayoutDashboard,
  Palette,
  PanelTop,
  Sparkles,
  Tags,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationGroups = [
  {
    label: "Principal",
    items: [
      { label: "Resumen", href: "/panel", icon: LayoutDashboard },
      { label: "Locales", href: "/panel/locales", icon: Building2 },
      { label: "Solicitudes", href: "/panel/solicitudes", icon: Inbox },
    ],
  },
  {
    label: "Contenido",
    items: [
      { label: "Destacados", href: "/panel/destacados", icon: Sparkles },
      { label: "Chips", href: "/panel/chips", icon: Tags },
      { label: "Imágenes", href: "/panel/imagenes", icon: FileImage },
    ],
  },
  {
    label: "Configuración",
    items: [
      { label: "Funnel", href: "/panel/funnel", icon: PanelTop },
      { label: "Diseño", href: "/panel/diseno", icon: Palette },
      { label: "Monetización", href: "/panel/monetizacion", icon: BadgeEuro },
    ],
  },
];

function isItemActive(pathname: string, href: string) {
  return href === "/panel" ? pathname === href : pathname.startsWith(href);
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="rounded-[1.35rem] border border-[#741314]/12 bg-[#FFF7E8] p-3 shadow-[0_18px_55px_rgba(116,19,20,0.08)] lg:sticky lg:top-5 lg:h-[calc(100svh-2.5rem)] lg:p-4">
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

      <nav aria-label="Navegación del panel" className="mt-2 lg:mt-0">
        <div className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-5 lg:overflow-visible lg:pb-0">
          {navigationGroups.map((group) => (
            <section key={group.label} aria-labelledby={`admin-nav-${group.label}`} className="shrink-0 lg:shrink">
              <p
                id={`admin-nav-${group.label}`}
                className="sr-only lg:not-sr-only lg:mb-2 lg:px-3 lg:text-[10px] lg:font-bold lg:uppercase lg:tracking-[0.16em] lg:text-[#741314]/45"
              >
                {group.label}
              </p>
              <ul className="flex gap-1.5 lg:block lg:space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(pathname, item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`inline-flex min-h-11 items-center gap-2.5 rounded-[0.85rem] border px-3 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2 lg:w-full ${
                          active
                            ? "border-[#741314] bg-[#741314] text-[#FFF7E8] shadow-[0_8px_22px_rgba(116,19,20,0.16)]"
                            : "border-transparent text-[#741314]/68 hover:border-[#741314]/12 hover:bg-[#741314]/[0.05] hover:text-[#741314]"
                        }`}
                      >
                        <Icon aria-hidden="true" className="h-[1.1rem] w-[1.1rem] shrink-0" strokeWidth={2} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
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
