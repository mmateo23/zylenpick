"use client";

import { useRef } from "react";

type BubbleBackgroundProps = {
  className?: string;
  onVideoReady?: () => void;
};

const demoVideoSrc =
  "https://cdn.pixabay.com/video/2024/01/18/197190-904257543_large.mp4";

export function BubbleBackground({
  className = "",
  onVideoReady,
}: BubbleBackgroundProps) {
  const hasReportedReadyRef = useRef(false);

  const handleVideoReady = () => {
    if (hasReportedReadyRef.current) {
      return;
    }

    hasReportedReadyRef.current = true;
    onVideoReady?.();
  };

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-[#040816]" />
      <div className="bubble-background-image absolute inset-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={handleVideoReady}
          onCanPlay={handleVideoReady}
          className="absolute inset-0 h-full w-full scale-105 object-cover"
        >
          <source src={demoVideoSrc} type="video/mp4" />
        </video>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,223,129,0.18),transparent_26%),linear-gradient(180deg,rgba(4,8,22,0.12),rgba(4,8,22,0.54)_56%,rgba(4,8,22,0.88))]" />
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(4,8,22,0.18)_8%,rgba(4,8,22,0.04)_34%,rgba(4,8,22,0.16)_58%,rgba(4,8,22,0.62)_100%)]" />
      <div className="absolute inset-y-0 left-0 w-[52%] bg-[linear-gradient(90deg,rgba(4,8,22,0.76),rgba(4,8,22,0.3),transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-[34%] bg-[linear-gradient(180deg,transparent,rgba(4,8,22,0.68)_55%,rgba(4,8,22,0.92))]" />
    </div>
  );
}
