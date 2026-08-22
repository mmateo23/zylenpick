import { ReactNode } from "react";

import { MobileCartBar } from "@/components/cart/mobile-cart-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { ZylenPickFooter } from "@/components/layout/zylenpick-footer";
import { ActiveOrderWidget } from "@/components/orders/active-order-widget";

type SiteShellProps = {
  children: ReactNode;
  showNavigation?: boolean;
  showBasicFooter?: boolean;
  wideContent?: boolean;
  className?: string;
};

export function SiteShell({
  children,
  showNavigation = true,
  showBasicFooter = true,
  wideContent = false,
  className,
}: SiteShellProps) {
  return (
    <div
      className={[
        "min-h-screen bg-[#fcfaf5] text-[#24110E]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <SiteHeader showNavigation={showNavigation} />
      <main
        className={
          wideContent
            ? "site-shell-main-wide"
            : "mx-auto w-full max-w-7xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12"
        }
      >
        {children}
      </main>
      <ActiveOrderWidget />
      <MobileCartBar />
      {showBasicFooter ? (
        <ZylenPickFooter theme="light" />
      ) : null}
    </div>
  );
}
