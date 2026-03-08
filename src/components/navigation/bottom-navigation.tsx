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
    <nav className="border-t border-[color:var(--border)] bg-[color:var(--surface)]/80 px-3 py-3">
      <ul className="grid grid-cols-4 gap-2">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <li key={item.label}>
              <Link
                href={item.href}
                className={`flex min-h-14 flex-col items-center justify-center rounded-2xl px-2 text-center text-xs font-medium transition ${
                  isActive
                    ? "bg-[color:var(--foreground)] text-white"
                    : "bg-[color:var(--surface-strong)] text-[color:var(--muted)]"
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
