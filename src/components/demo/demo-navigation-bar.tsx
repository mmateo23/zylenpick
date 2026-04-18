"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type DemoNavigationBarProps = {
  citySlug?: string | null;
};

const baseItems = [
  { label: "Inicio", href: "/" },
  { label: "Zonas", href: "/zonas" },
  { label: "Platos", href: "/platos" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/demo") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DemoNavigationBar({
  citySlug = null,
}: DemoNavigationBarProps) {
  const pathname = usePathname();
  const items = citySlug
    ? [
        ...baseItems,
        { label: "Ciudad", href: `/zonas/${citySlug}` },
      ]
    : baseItems;

  return (
    <nav
      aria-label="Navegación demo"
      className="mt-5 sm:mt-6"
    >
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => {
          const isActive = isActivePath(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`inline-flex rounded-full border px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.22em] backdrop-blur-xl transition ${
                  isActive
                    ? "border-[#7cffb8]/18 bg-[#7cffb8]/10 text-[#d9ffe8]"
                    : "border-white/10 bg-white/[0.04] text-white/64 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
