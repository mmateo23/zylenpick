"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavigationItem = {
  label: string;
  href: string;
};

type BottomNavigationProps = {
  items: NavigationItem[];
};

export function BottomNavigation({ items }: BottomNavigationProps) {
  const pathname = usePathname();

  return (
    <nav className="border-t border-white/14 bg-white/[0.10] px-3 py-3 backdrop-blur-2xl backdrop-saturate-150">
      <ul className="grid grid-cols-4 gap-2">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <li key={item.label}>
              <Link
                href={item.href}
                className={`flex min-h-14 flex-col items-center justify-center rounded-2xl px-2 text-center text-xs font-medium transition ${
                  isActive
                    ? "bg-white/[0.16] text-[color:var(--text-inverse)]"
                    : "bg-white/[0.08] text-[color:var(--text-muted)]"
                }`}
              >
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
