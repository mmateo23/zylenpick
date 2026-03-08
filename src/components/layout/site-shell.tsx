import { ReactNode } from "react";

import { MobileCartBar } from "@/components/cart/mobile-cart-bar";
import { SiteHeader } from "@/components/layout/site-header";

type SiteShellProps = {
  children: ReactNode;
  showNavigation?: boolean;
};

export function SiteShell({
  children,
  showNavigation = true,
}: SiteShellProps) {
  return (
    <div className="min-h-screen">
      <SiteHeader showNavigation={showNavigation} />
      <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {children}
      </main>
      <MobileCartBar />
      <footer className="px-5 pb-8 text-center text-sm text-[color:var(--muted)] sm:px-6 lg:px-8">
        by ZylenLabs
      </footer>
    </div>
  );
}
