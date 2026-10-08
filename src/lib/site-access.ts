// Shared invitation gate. This does not replace venue tokens or account permissions.
export const ACCESS_COOKIE = "pickyalo-invitation";
export const ACCESS_DURATION = 60 * 60 * 24 * 30;
export const isSiteGateEnabled = () => process.env.PICKYALO_ACCESS_GATE !== "false";
export const getAccessPassword = () => process.env.PICKYALO_ACCESS_PASSWORD || "PickyaTala";

const encoder = new TextEncoder();
async function signingKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(process.env.PICKYALO_ACCESS_SECRET || getAccessPassword()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createAccessTicket(now = Date.now()) {
  const expiry = String(Math.floor(now / 1000) + ACCESS_DURATION);
  const signature = await crypto.subtle.sign("HMAC", await signingKey(), encoder.encode(expiry));
  return `${expiry}.${Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export async function hasSiteAccess(ticket?: string, now = Date.now()) {
  if (!ticket || !/^\d{10}\.[a-f0-9]{64}$/.test(ticket)) return false;
  const [expiry, signature] = ticket.split(".");
  const remaining = Number(expiry) - Math.floor(now / 1000);
  if (remaining <= 0 || remaining > ACCESS_DURATION) return false;
  const bytes = Uint8Array.from(signature.match(/.{2}/g)!, (byte) => Number.parseInt(byte, 16));
  return crypto.subtle.verify("HMAC", await signingKey(), bytes, encoder.encode(expiry));
}

export function safeAccessDestination(value?: string | null) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  try {
    const destination = new URL(value, "https://pickyalo.invalid");
    if (destination.origin !== "https://pickyalo.invalid" || destination.pathname === "/entrada" || destination.pathname.startsWith("/api/")) return "/";
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch { return "/"; }
}
