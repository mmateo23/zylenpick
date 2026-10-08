import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { VenueOpeningStatusBadge } from "@/components/venues/venue-opening-status-badge";
import type { DiscoveryVenue } from "@/features/discovery/discovery-content";
import { venueHref } from "@/features/discovery/discovery-content";
import type { VenuePresentation } from "@/features/discovery/discovery-config";
import type { HomeShowcaseItem } from "@/features/venues/types";
import { resolveVenueCategory, resolveVenueCoordinates } from "@/features/venues/venue-meta";
import { getDiscoveryJourney } from "@/features/discovery/discovery-filters";
import { formatOpeningHoursDay, getVenueOpeningStatus } from "@/features/venues/opening-hours";
import type { UserLocation } from "@/features/location/browser-location";
import styles from "../demo/discovery-explorer.module.css";

export function DiscoveryVenueCard({ venue, items, presentation, location }: { venue: DiscoveryVenue; items: HomeShowcaseItem[]; presentation?: VenuePresentation; location: UserLocation | null }) {
  const product = items.find(item => item.id === presentation?.productId && item.venue.id === venue.id) ?? items.find(item => item.venue.id === venue.id);
  const image = presentation?.image === "product" ? product?.imageUrl || venue.coverUrl : venue.coverUrl || product?.imageUrl;
  const category = resolveVenueCategory(venue.slug, venue.discoveryCategory);
  const description = venue.description?.trim() || "Conoce lo que hacen aquí y descubre su selección.";
  const coordinates = resolveVenueCoordinates(venue);
  const journey = getDiscoveryJourney(
    {
      latitude: coordinates?.latitude ?? null,
      longitude: coordinates?.longitude ?? null,
    },
    location,
  );
  const accessibleDistance = journey
    ? `. ${journey.timeLabel}. ${journey.quip}.`
    : "";
  const openingStatus = getVenueOpeningStatus(venue.openingHours, venue.manualOpenStatus);
  const todayHours = formatOpeningHoursDay(venue.openingHours[openingStatus.dayKey]);

  return <Link href={venueHref(venue)} className={`pickyalo-media-card explore-card ${styles.venueCard}`} aria-label={`Ver local: ${venue.name}${accessibleDistance}`}>
    {image ? <Image src={image} alt="" fill sizes="(max-width:640px)50vw,33vw" className={styles.venueImage} /> : <span className={styles.venueInitial}>{venue.name.slice(0, 1)}</span>}
    <span className={styles.venueShade} />
    <span className={styles.venueTag}>
      {journey ? <>
        <span className={styles.venueDistanceTime}><Clock3 size={12} aria-hidden="true" />{journey.timeLabel}</span>
      </> : "Pickyalo local"}
    </span>
    <span className={styles.venueCaption}>
      <span className={styles.venueTitleRow}>
        <strong>{venue.name}</strong>
        {journey ? <span className={styles.venueDistanceQuip}>{journey.quip}</span> : null}
      </span>
      <span className={styles.venueDescription}>{description}</span>
      <span className={styles.venueMeta}>
        <span>{category === "Otros" ? "Comercio local" : category}</span>
        <VenueOpeningStatusBadge openingHours={venue.openingHours} initialStatus={openingStatus} compact className={styles.venueStatus} />
        {todayHours !== "Cerrado" ? <span>Hoy · {todayHours}</span> : null}
      </span>
      <span className={styles.venueCta}>Ver el local <ArrowUpRight size={17} aria-hidden="true" /></span>
    </span>
  </Link>;
}
