"use client";

import type { CSSProperties } from "react";

type BorderBeamProps = {
  className?: string;
  duration?: number;
  delay?: number;
  size?: number;
  borderWidth?: number;
  reverse?: boolean;
  initialOffset?: number;
  colorFrom?: string;
  colorTo?: string;
  glow?: boolean;
};

export function BorderBeam({
  className = "",
  duration = 8,
  delay = 0,
  size = 240,
  borderWidth = 1.5,
  reverse = false,
  initialOffset = 0,
  colorFrom = "#F3D58D",
  colorTo = "#D6A648",
  glow = false,
}: BorderBeamProps) {
  const wrapperStyle = {
    "--beam-duration": `${duration}s`,
    "--beam-delay": `${delay}s`,
    "--beam-direction": reverse ? "reverse" : "normal",
    "--beam-border-width": `${borderWidth}px`,
    "--beam-size": `${size}px`,
    "--beam-initial-offset": `${initialOffset}deg`,
  } as CSSProperties;

  const maskStyle = {
    WebkitMask:
      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
  } as CSSProperties;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
    >
      <div
        className="magic-border-beam absolute inset-[-120%] rounded-[inherit]"
        style={wrapperStyle}
      >
        <div
          className={`absolute inset-0 rounded-[inherit] bg-[conic-gradient(from_180deg_at_50%_50%,transparent_0deg,transparent_120deg,rgba(243,213,141,0.08)_150deg,rgba(243,213,141,0.95)_180deg,rgba(214,166,72,1)_210deg,rgba(243,213,141,0.28)_236deg,transparent_270deg,transparent_360deg)] p-[var(--beam-border-width)] ${className}`}
          style={{
            ...maskStyle,
            backgroundImage: `conic-gradient(from 180deg at 50% 50%, transparent 0deg, transparent 120deg, ${colorFrom}14 150deg, ${colorFrom} 180deg, ${colorTo} 210deg, ${colorFrom}47 236deg, transparent 270deg, transparent 360deg)`,
            filter: glow
              ? `drop-shadow(0 0 4px ${colorFrom}) drop-shadow(0 0 8px ${colorTo})`
              : undefined,
          }}
        />
      </div>
    </div>
  );
}
