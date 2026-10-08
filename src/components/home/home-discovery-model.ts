export type HomePath = "comer" | "descubrir" | "eventos";
export type HomePeriod = "proximos" | "hoy" | "fin-de-semana";

export type HomeSelection = {
  path: HomePath | null;
  category: string;
  period: HomePeriod;
};

export type HomeResult = {
  id: string;
  path: HomePath;
  kind: "product" | "venue" | "place" | "workshop" | "event" | "campaign";
  title: string;
  subtitle: string;
  category: string;
  categoryLabel: string;
  image: string | null;
  href: string;
  cta: string;
  price?: string;
  latitude?: number;
  longitude?: number;
  // These must be occurrence dates, never publication/campaign dates.
  startsOn?: string;
  endsOn?: string;
};

export const initialHomeSelection: HomeSelection = { path: null, category: "", period: "proximos" };

export function readHomeSelection(params: Pick<URLSearchParams, "get">): HomeSelection {
  const via = params.get("via");
  const path = via === "comer" || via === "descubrir" || via === "eventos" ? via : null;
  const period = params.get("cuando");
  return {
    path,
    category: path ? (params.get("categoria") ?? "").slice(0, 120) : "",
    period: path === "eventos" && (period === "hoy" || period === "fin-de-semana") ? period : "proximos",
  };
}

export function homeHref(city: string, selection: HomeSelection) {
  const params = new URLSearchParams();
  if (city) params.set("ciudad", city);
  if (selection.path) params.set("via", selection.path);
  if (selection.path && selection.category) params.set("categoria", selection.category);
  if (selection.path === "eventos" && selection.period !== "proximos") params.set("cuando", selection.period);
  return params.size ? `/?${params}` : "/";
}

export function madridToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

function validDate(value?: string): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value);
}

export function matchesHomePeriod(item: HomeResult, period: HomePeriod, today: string) {
  if (item.kind !== "event") return true;
  const start = item.startsOn;
  const end = item.endsOn || start;
  if (!validDate(start) || !validDate(end) || end < start || end < today) return false;
  if (period === "proximos") return true;
  if (period === "hoy") return start <= today && end >= today;
  const date = new Date(`${today}T12:00:00Z`);
  const day = date.getUTCDay();
  const saturday = new Date(date);
  saturday.setUTCDate(date.getUTCDate() + (day === 0 ? -1 : (6 - day)));
  const sunday = new Date(saturday);
  sunday.setUTCDate(saturday.getUTCDate() + 1);
  return start <= sunday.toISOString().slice(0, 10) && end >= saturday.toISOString().slice(0, 10);
}

export function homeResults(items: HomeResult[], selection: HomeSelection, today: string) {
  return items.filter((item) => item.path === selection.path && matchesHomePeriod(item, selection.period, today)
    && (!selection.category || item.category === selection.category));
}

export function homeNowItems(items: HomeResult[], today: string, limit = 5) {
  const available = items.filter((item) => matchesHomePeriod(item, "proximos", today));
  const commerce = available.filter((item) => item.path === "comer");
  const places = available.filter((item) => item.path === "descubrir");
  const events = available.filter((item) => item.path === "eventos");
  const preferred = [
    commerce[0],
    places[0],
    commerce[1],
    events[0] ?? places[1],
    commerce[2] ?? places[2],
  ].filter((item): item is HomeResult => Boolean(item));
  const seen = new Set(preferred.map((item) => item.id));
  const remaining = available.filter((item) => !seen.has(item.id));
  return [...preferred, ...remaining].slice(0, Math.max(0, limit));
}

export function homeCategories(items: HomeResult[], selection: HomeSelection, today: string) {
  const options = new Map<string, { value: string; label: string; count: number }>();
  homeResults(items, { ...selection, category: "" }, today).forEach((item) => {
    if (!item.category) return;
    const option = options.get(item.category);
    options.set(item.category, { value: item.category, label: item.categoryLabel, count: (option?.count ?? 0) + 1 });
  });
  return Array.from(options.values()).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "es"));
}

// Keep a category across a change only if it still describes available results.
export function changeHomeSelection(items: HomeResult[], previous: HomeSelection, patch: Partial<HomeSelection>, today: string) {
  const next = { ...previous, ...patch };
  if (!next.path) return initialHomeSelection;
  if (next.path !== "eventos") next.period = "proximos";
  if (!("category" in patch) && next.category && !homeCategories(items, next, today).some((option) => option.value === next.category)) next.category = "";
  return next;
}
