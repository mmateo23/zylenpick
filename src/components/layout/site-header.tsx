"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Store } from "lucide-react";

import styles from "./site-header.module.css";

export function SiteHeader({ showNavigation = true }: { showNavigation?: boolean }) {
  const pathname = usePathname();
  const itemClass = (active: boolean) => `group relative inline-flex h-12 w-12 items-center justify-center rounded-[0.8rem] transition ${styles.focusRing} ${styles.navItem} ${active ? styles.navItemActive : ""}`;
  const itemLabelClass = `pointer-events-none absolute left-1/2 top-[calc(100%+.45rem)] z-10 hidden -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-full border px-2.5 py-1.5 text-[11px] font-bold opacity-0 shadow-[0_8px_22px_rgba(36,17,14,.16)] backdrop-blur-md transition sm:block sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-visible:translate-y-0 sm:group-focus-visible:opacity-100 ${styles.itemLabel}`;
  return (
    <header className="sticky top-[max(0.7rem,env(safe-area-inset-top))] z-40 px-3 sm:px-6 lg:px-8">
      <nav aria-label="Navegación principal" className="pickyalo-floating-surface mx-auto flex w-fit items-center justify-center gap-2 rounded-[1.15rem] border p-1.5">
        {showNavigation ? <Link href="/platos?modo=locales" prefetch={false} className={itemClass(pathname.startsWith("/platos") || pathname.startsWith("/zonas"))} aria-label="Comercios" aria-current={pathname.startsWith("/platos") ? "page" : undefined}><Store size={21} aria-hidden="true" /><span className={itemLabelClass}>Comercios</span></Link> : null}
        <Link href="/" aria-label="Ir al inicio" aria-current={pathname === "/" ? "page" : undefined} className={`inline-flex h-12 min-w-[6.75rem] items-center justify-center rounded-2xl px-1 ${styles.focusRing}`}>
          <Image src="/logo/LogoNuevo.svg" alt="Pickyalo" width={108} height={38} className={`${styles.logoLight} h-auto w-[6.75rem]`} priority />
          <Image src="/logo/LogoNuevo_Negativo.svg" alt="Pickyalo" width={108} height={38} className={`${styles.logoDark} h-auto w-[6.75rem]`} priority />
        </Link>
        {showNavigation ? <Link href="/mapa?explora=1" prefetch={false} className={itemClass(pathname.startsWith("/mapa") || pathname.startsWith("/explora"))} aria-label="Descubrir" aria-current={pathname.startsWith("/mapa") ? "page" : undefined}><Compass size={21} aria-hidden="true" /><span className={itemLabelClass}>Descubrir</span></Link> : null}
      </nav>
    </header>
  );
}
