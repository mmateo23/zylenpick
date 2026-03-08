"use client";

import Image from "next/image";

type FeedMediaProps = {
  mediaType: "image" | "video";
  mediaUrl: string;
  mediaAlt: string;
  posterUrl?: string;
};

export function FeedMedia({
  mediaType,
  mediaUrl,
  mediaAlt,
  posterUrl,
}: FeedMediaProps) {
  if (mediaType === "video") {
    return (
      <div className="absolute inset-0 overflow-hidden bg-black">
        <video
          className="absolute inset-0 h-full w-full object-cover object-center"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={posterUrl}
          aria-label={mediaAlt}
        >
          <source src={mediaUrl} type="video/mp4" />
        </video>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <Image
        src={mediaUrl}
        alt={mediaAlt}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 420px"
        className="object-cover object-center"
      />
    </div>
  );
}
