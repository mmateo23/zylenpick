"use client";

import {
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
} from "react";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type NativeDirectionsLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "target"
> & {
  destination: Coordinates;
  origin?: Coordinates | null;
  destinationLabel?: string;
};

function isAppleDevice() {
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;

  return (
    /iPhone|iPad|iPod/i.test(userAgent) ||
    (platform === "MacIntel" && window.navigator.maxTouchPoints > 1)
  );
}

function buildGoogleMapsUrl(
  destination: Coordinates,
  origin?: Coordinates | null,
) {
  const params = new URLSearchParams({
    api: "1",
    destination: `${destination.latitude},${destination.longitude}`,
    travelmode: "walking",
  });

  if (origin) {
    params.set("origin", `${origin.latitude},${origin.longitude}`);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function buildAppleMapsUrl(
  destination: Coordinates,
  destinationLabel?: string,
) {
  const params = new URLSearchParams({
    daddr: `${destination.latitude},${destination.longitude}`,
    dirflg: "w",
  });

  if (destinationLabel?.trim()) {
    params.set("q", destinationLabel.trim());
  }

  return `https://maps.apple.com/?${params.toString()}`;
}

export function NativeDirectionsLink({
  destination,
  origin = null,
  destinationLabel,
  children,
  rel,
  ...props
}: NativeDirectionsLinkProps) {
  const googleMapsUrl = useMemo(
    () => buildGoogleMapsUrl(destination, origin),
    [destination, origin],
  );
  const appleMapsUrl = useMemo(
    () => buildAppleMapsUrl(destination, destinationLabel),
    [destination, destinationLabel],
  );
  const [href, setHref] = useState(googleMapsUrl);

  useEffect(() => {
    setHref(isAppleDevice() ? appleMapsUrl : googleMapsUrl);
  }, [appleMapsUrl, googleMapsUrl]);

  return (
    <a href={href} rel={rel ?? "external"} {...props}>
      {children}
    </a>
  );
}
