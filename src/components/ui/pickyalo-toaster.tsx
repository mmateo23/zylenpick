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
        fill: "#fffdf5",
        autopilot: false,
        styles: {
          title: "font-weight: 800; color: #381932;",
          description: "color: rgba(56, 25, 50, 0.72);",
          button: "font-weight: 700;",
        },
      }}
    />
  );
}
