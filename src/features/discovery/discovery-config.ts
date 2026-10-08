export const SHOT_IDS = ["sabor-en-video", "simpre-fit", "huelaa-bbq"] as const;
export type ShotId = typeof SHOT_IDS[number];
export type VenuePresentation = { image: "cover" | "product"; productId: string; menu: "photos" | "written" };
export type ShotConfig = { enabled: boolean; source: string; mediaType: "image" | "video"; mediaUrl: string; sponsored: boolean; startsOn: string; endsOn: string };
export type DiscoveryConfig = { venues: Record<string, VenuePresentation>; shots: Partial<Record<ShotId, ShotConfig>> };
export const emptyDiscovery: DiscoveryConfig = { venues: {}, shots: {} };

export function safeMediaUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const url = value.trim();
  if (/^\/(?!\/)/.test(url) && !/[\\\s]/.test(url)) return url;
  try { const parsed = new URL(url); return parsed.protocol === "https:" && !parsed.username && !parsed.password ? url : ""; } catch { return ""; }
}
const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const string = (value: unknown) => typeof value === "string" ? value.trim() : "";
const date = (value: unknown) => /^\d{4}-\d{2}-\d{2}$/.test(string(value)) ? string(value) : "";
export function normalizeDiscovery(value: unknown): DiscoveryConfig {
  const raw = object(value);
  const venues: DiscoveryConfig["venues"] = {};
  for (const [id, data] of Object.entries(object(raw.venues))) {
    if (!/^[a-f0-9-]{36}$/i.test(id)) continue;
    const row = object(data);
    venues[id] = { image: row.image === "product" ? "product" : "cover", productId: string(row.productId), menu: row.menu === "written" ? "written" : "photos" };
  }
  const shots: DiscoveryConfig["shots"] = {};
  for (const id of SHOT_IDS) {
    const value = object(raw.shots)[id];
    if (!value) continue;
    const row = object(value);
    shots[id] = { enabled: row.enabled !== false, source: string(row.source), mediaType: row.mediaType === "video" ? "video" : "image", mediaUrl: safeMediaUrl(row.mediaUrl), sponsored: row.sponsored === true, startsOn: date(row.startsOn), endsOn: date(row.endsOn) };
  }
  return { venues, shots };
}
export function isShotScheduled(config: ShotConfig, now = new Date()) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  return (!config.startsOn || config.startsOn <= today) && (!config.endsOn || config.endsOn >= today);
}
