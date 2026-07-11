"use client";

import { Toaster } from "sileo";

export function PickyaloToaster() {
  return (
    <Toaster
      position="bottom-right"
      offset={{ bottom: 18, right: 18, left: 18 }}
      theme="light"
      options={{
        duration: 4200,
        roundness: 18,
        fill: "#FFF7E8",
        autopilot: false,
        styles: {
          title: "font-weight: 800; color: #24110E;",
          description: "color: rgba(36, 17, 14, 0.68);",
          button: "font-weight: 700;",
        },
      }}
    />
  );
}
