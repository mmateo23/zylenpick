"use client";

import { useEffect, useState } from "react";

type LightRaysProps = {
  className?: string;
};

function joinClasses(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export function LightRays({ className }: LightRaysProps) {
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => {
      setIsReducedMotion(mediaQuery.matches);
    };

    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);

    return () => {
      mediaQuery.removeEventListener("change", syncPreference);
    };
  }, []);

  const rays = [
    "left-[8%] top-[-12%] h-[130%] w-28 rotate-[18deg]",
    "left-[28%] top-[-18%] h-[142%] w-24 rotate-[8deg]",
    "right-[24%] top-[-14%] h-[138%] w-32 -rotate-[14deg]",
    "right-[8%] top-[-10%] h-[126%] w-24 -rotate-[22deg]",
  ];

  return (
    <div
      aria-hidden="true"
      className={joinClasses(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(111,207,151,0.10),transparent_34%)]" />
      {rays.map((rayClassName, index) => (
        <span
          key={rayClassName}
          className={joinClasses(
            "project-light-ray absolute rounded-full opacity-40 blur-[2px]",
            rayClassName,
          )}
          style={{
            animationDelay: `${index * 0.8}s`,
            animationDuration: `${8 + index * 1.4}s`,
            animationPlayState: isReducedMotion ? "paused" : "running",
          }}
        />
      ))}
    </div>
  );
}
