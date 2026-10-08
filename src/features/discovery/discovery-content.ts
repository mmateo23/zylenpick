import type { PublicExploreMapEntry } from "@/features/explore/types";
import type { HomeShowcaseItem, VenueListItem } from "@/features/venues/types";
import { getHomeCampaignImage, isHomeCampaignActive, type HomeCampaignConfig } from "@/features/design/site-design-config";
import { isShotScheduled, SHOT_IDS, type DiscoveryConfig, type ShotId } from "./discovery-config";

export type DiscoveryVenue = VenueListItem & { citySlug: string; cityName: string };
export type DiscoverySource = { id: string; title: string; description: string; imageUrl: string | null; href: string; label: string; ctaLabel: string; latitude: number | null; longitude: number | null; sponsored?: boolean; videoUrl?: string | null; dateLabel?: string };
export type DiscoveryShot = DiscoverySource & { slot: ShotId; videoUrl: string | null; sponsored: boolean };
export const venueHref = (venue: DiscoveryVenue) => `/zonas/${venue.citySlug}/venues/${venue.slug}`;

const busDiscoverySource: DiscoverySource = {
  id: "utility:autobuses",
  title: "Tu autobús, sin dar vueltas.",
  description: "Consulta qué líneas pasan por cada parada, el sentido y las próximas salidas.",
  imageUrl: "/images/transit/talavera-ceramic-wallpaper.jpg",
  href: "/autobuses",
  label: "Autobuses urbanos",
  ctaLabel: "Ver líneas y horarios",
  latitude: null,
  longitude: null,
  dateLabel: "Líneas y horarios",
};

export function discoverySources(entries: PublicExploreMapEntry[], venues: DiscoveryVenue[], items: HomeShowcaseItem[], campaign: HomeCampaignConfig): DiscoverySource[] {
  return [
    busDiscoverySource,
    ...entries.map(entry => ({ id: `explore:${entry.mapPlaceId}`, title: entry.pointTitle, description: entry.introduction, imageUrl: entry.imageUrl, href: `/explora/${entry.routeSlug}/${entry.pointSlug}?unlock=${entry.publicToken}`, label: "Explora Talavera", ctaLabel: "Ver lugar", latitude: entry.latitude ?? null, longitude: entry.longitude ?? null })),
    ...venues.map(venue => ({ id: `venue:${venue.id}`, title: venue.name, description: venue.description ?? "Descubre lo que hacen aquí.", imageUrl: venue.coverUrl, href: venueHref(venue), label: "Lo local", ctaLabel: "Ver local", latitude: venue.latitude, longitude: venue.longitude })),
    ...items.map(item => ({ id: `product:${item.id}`, title: item.name, description: item.description ?? item.venue.name, imageUrl: item.imageUrl, href: `/platos?post=${item.id}`, label: item.venue.name, ctaLabel: "Ver producto", latitude: item.venue.latitude, longitude: item.venue.longitude })),
    ...(isHomeCampaignActive(campaign) ? [{ id: "campaign:home", title: campaign.title, description: campaign.description, imageUrl: getHomeCampaignImage(campaign, "/home/assets/drive_teatro_victoria.png"), href: campaign.href, label: "En la agenda", ctaLabel: campaign.ctaLabel, latitude: null, longitude: null, sponsored: campaign.sponsored, videoUrl: campaign.backgroundMediaType === "video" ? campaign.backgroundMediaUrl : null, dateLabel: campaign.startsOn ? new Intl.DateTimeFormat("es-ES", {day:"numeric", month:"short", timeZone:"Europe/Madrid"}).format(new Date(`${campaign.startsOn}T12:00:00+02:00`)) : undefined }] : []),
  ];
}

export function resolveDiscoveryShots(config: DiscoveryConfig, sources: DiscoverySource[], now = new Date()): DiscoveryShot[] {
  const editorial = [
    ...sources.filter(source => source.id.startsWith("utility:") && source.imageUrl),
    ...sources.filter(source => source.id.startsWith("explore:") && source.imageUrl),
  ];
  const used = new Set<string>();
  return SHOT_IDS.flatMap((slot) => {
    const selected = config.shots[slot];
    if (selected?.enabled === false) return [];
    const scheduled = selected && isShotScheduled(selected, now);
    const chosen = scheduled ? sources.find(source => source.id === selected.source) : undefined;
    const source = chosen ?? editorial.find(source => !used.has(source.id));
    if (!source || (!source.imageUrl && !selected?.mediaUrl)) return [];
    used.add(source.id);
    const media = chosen && selected?.mediaUrl ? selected : null;
    return [{ ...source, slot, imageUrl: media?.mediaType === "image" ? media.mediaUrl : source.imageUrl, videoUrl: media?.mediaType === "video" ? media.mediaUrl : source.videoUrl ?? null, sponsored: Boolean(source.sponsored || (chosen && selected?.sponsored)) }];
  });
}
