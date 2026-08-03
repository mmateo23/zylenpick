"use client";

import { usePathname } from "next/navigation";

import { NearModeControl } from "@/components/location/near-mode-control";

export function LocationDiscoveryPrompt() {
  const pathname = usePathname();

  // Public pages expose this control in the navigation dock; Home has no dock.
  if (pathname !== "/") {
    return null;
  }

  return <NearModeControl floating />;
}
