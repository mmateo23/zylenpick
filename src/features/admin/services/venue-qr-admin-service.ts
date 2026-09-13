"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import {
  createAdminDataClient,
  createAdminMutationClient,
  requireAuthorizedAdminSession,
} from "@/features/admin/services/admin-auth";
import {
  DEFAULT_VENUE_QR_FAVORITES_COPY,
  normalizeVenueQrFavoritesCopy,
} from "@/features/venues/qr-content";
import type { VenueQrFavoritesCopy } from "@/features/venues/types";

const STORAGE_BUCKET = "pickyalo-media";

export type AdminVenueQrFeaturedItem = {
  id: string;
  name: string;
  imageUrl: string | null;
  categoryName: string | null;
};

export type AdminVenueQrPromotion = {
  id: string | null;
  isEnabled: boolean;
  brandName: string;
  headline: string;
  description: string;
  imageUrl: string | null;
  relatedMenuItemId: string | null;
  startsAt: string | null;
  endsAt: string | null;
};

export type AdminVenueQrSettings = {
  venueId: string;
  venueName: string;
  venueSlug: string;
  citySlug: string;
  coverUrl: string | null;
  qrEnabled: boolean;
  qrHeroImageUrl: string | null;
  qrShowNearby: boolean;
  qrFavorites: VenueQrFavoritesCopy;
  qrHostName: string | null;
  qrHeroTagline: string;
  qrStory: string;
  qrStoryImageUrls: string[];
  featuredItems: AdminVenueQrFeaturedItem[];
  menuItems: AdminVenueQrFeaturedItem[];
  promotion: AdminVenueQrPromotion;
};

function isMissingQrColumnError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("qr_enabled") ||
    normalized.includes("qr_hero_image_url") ||
    normalized.includes("qr_show_nearby") ||
    normalized.includes("qr_favorites_eyebrow") ||
    normalized.includes("qr_favorites_title") ||
    normalized.includes("qr_favorites_description") ||
    normalized.includes("qr_host_name") ||
    normalized.includes("qr_hero_tagline") ||
    normalized.includes("qr_story")
  );
}

function getFeaturedPriority(item: {
  is_featured: boolean;
  is_pickup_month_highlight: boolean;
  is_home_featured: boolean;
}) {
  if (item.is_featured) return 0;
  if (item.is_pickup_month_highlight) return 1;
  if (item.is_home_featured) return 2;
  return 3;
}

function validateImageUrl(value: string) {
  if (!value) return null;
  if (value.startsWith("/")) return value;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("La URL de la imagen no es válida.");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("La imagen debe usar una URL HTTP o HTTPS.");
  }

  return value;
}

function getManagedQrStoragePath(imageUrl: string | null, venueId: string) {
  if (!imageUrl) return null;
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const markerIndex = imageUrl.indexOf(marker);
  if (markerIndex < 0) return null;

  const path = decodeURIComponent(imageUrl.slice(markerIndex + marker.length));
  return path.startsWith(`venues/${venueId}/qr/`) ? path : null;
}

function getManagedPromotionStoragePath(
  imageUrl: string | null,
  venueId: string,
) {
  const path = getManagedQrStoragePath(imageUrl, venueId);
  return path?.startsWith(`venues/${venueId}/qr/promotion/`) ? path : null;
}

function getManagedStoryStoragePath(imageUrl: string | null, venueId: string) {
  const path = getManagedQrStoragePath(imageUrl, venueId);
  return path?.startsWith(`venues/${venueId}/qr/story/`) ? path : null;
}

function getManagedHeroStoragePath(imageUrl: string | null, venueId: string) {
  const path = getManagedQrStoragePath(imageUrl, venueId);
  return path &&
    !path.startsWith(`venues/${venueId}/qr/promotion/`) &&
    !path.startsWith(`venues/${venueId}/qr/story/`)
    ? path
    : null;
}

function normalizeOptionalDate(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return null;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    throw new Error("La fecha de la promoción no es válida.");
  }
  return date.toISOString();
}

async function getVenuePathContext(venueId: string) {
  const supabase = await createAdminDataClient();
  const { data, error } = await supabase
    .from("venues")
    .select("slug, qr_hero_image_url, cities!inner(slug)")
    .eq("id", venueId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load venue QR context: ${error.message}`);
  }
  if (!data) throw new Error("No hemos encontrado el local seleccionado.");

  return {
    venueSlug: data.slug,
    citySlug: data.cities.slug,
    qrHeroImageUrl: data.qr_hero_image_url,
  };
}

function revalidateVenueQrPaths(
  venueId: string,
  venueSlug: string,
  citySlug: string,
) {
  revalidatePath(`/q/${venueSlug}`);
  revalidatePath(`/zonas/${citySlug}/venues/${venueSlug}`);
  revalidatePath(`/panel/locales/${venueId}/qr`);
}

async function removeReplacedQrImage(
  venueId: string,
  previousUrl: string | null,
  nextUrl: string | null,
) {
  if (!previousUrl || previousUrl === nextUrl) return;
  const previousPath = getManagedHeroStoragePath(previousUrl, venueId);
  if (!previousPath) return;

  const supabase = await createAdminMutationClient();
  await supabase.storage.from(STORAGE_BUCKET).remove([previousPath]);
}

async function removeReplacedPromotionImage(
  venueId: string,
  previousUrl: string | null,
  nextUrl: string | null,
) {
  if (!previousUrl || previousUrl === nextUrl) return;
  const previousPath = getManagedPromotionStoragePath(previousUrl, venueId);
  if (!previousPath) return;

  const supabase = await createAdminMutationClient();
  await supabase.storage.from(STORAGE_BUCKET).remove([previousPath]);
}

export async function getAdminVenueQrSettings(
  venueId: string,
): Promise<AdminVenueQrSettings | null> {
  const supabase = await createAdminDataClient();
  let { data: venue, error: venueError } = await supabase
    .from("venues")
    .select(
      "id, name, slug, cover_url, qr_enabled, qr_hero_image_url, qr_show_nearby, qr_favorites_eyebrow, qr_favorites_title, qr_favorites_description, qr_host_name, qr_hero_tagline, qr_story, qr_story_image_urls, cities!inner(slug)",
    )
    .eq("id", venueId)
    .maybeSingle();

  if (venueError && isMissingQrColumnError(venueError.message)) {
    const fallback = await supabase
      .from("venues")
      .select("id, name, slug, cover_url, cities!inner(slug)")
      .eq("id", venueId)
      .maybeSingle();
    venue = fallback.data
      ? {
          ...fallback.data,
          qr_enabled: true,
          qr_hero_image_url: null,
          qr_show_nearby: true,
          qr_favorites_eyebrow: DEFAULT_VENUE_QR_FAVORITES_COPY.eyebrow,
          qr_favorites_title: DEFAULT_VENUE_QR_FAVORITES_COPY.title,
          qr_favorites_description:
            DEFAULT_VENUE_QR_FAVORITES_COPY.description,
          qr_host_name: null,
          qr_hero_tagline: null,
          qr_story: null,
          qr_story_image_urls: [],
        }
      : null;
    venueError = fallback.error;
  }

  if (venueError) {
    throw new Error(`Unable to load venue QR settings: ${venueError.message}`);
  }
  if (!venue) return null;

  const { data: menuItems, error: menuError } = await supabase
    .from("menu_items")
    .select(
      "id, name, image_url, category_name, is_featured, is_home_featured, is_pickup_month_highlight",
    )
    .eq("venue_id", venueId)
    .eq("is_available", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (menuError) {
    throw new Error(`Unable to load QR featured items: ${menuError.message}`);
  }

  const { data: promotion, error: promotionError } = await supabase
    .from("venue_qr_promotions")
    .select(
      "id, is_enabled, brand_name, headline, description, image_url, related_menu_item_id, starts_at, ends_at",
    )
    .eq("venue_id", venueId)
    .maybeSingle();

  if (promotionError && promotionError.code !== "42P01") {
    throw new Error(
      `Unable to load venue QR promotion: ${promotionError.message}`,
    );
  }

  const availableItems = (menuItems ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    imageUrl: item.image_url,
    categoryName: item.category_name,
  }));
  const featuredItems = [...(menuItems ?? [])]
    .sort(
      (first, second) =>
        getFeaturedPriority(first) - getFeaturedPriority(second),
    )
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      name: item.name,
      imageUrl: item.image_url,
      categoryName: item.category_name,
    }));

  return {
    venueId: venue.id,
    venueName: venue.name,
    venueSlug: venue.slug,
    citySlug: venue.cities.slug,
    coverUrl: venue.cover_url,
    qrEnabled: venue.qr_enabled,
    qrHeroImageUrl: venue.qr_hero_image_url,
    qrShowNearby: venue.qr_show_nearby,
    qrFavorites: normalizeVenueQrFavoritesCopy({
      eyebrow: venue.qr_favorites_eyebrow,
      title: venue.qr_favorites_title,
      description: venue.qr_favorites_description,
    }),
    qrHostName: venue.qr_host_name?.trim() || null,
    qrHeroTagline: venue.qr_hero_tagline?.trim() || "",
    qrStory: venue.qr_story?.trim() || "",
    qrStoryImageUrls: (venue.qr_story_image_urls ?? [])
      .map((url) => url.trim())
      .filter(Boolean)
      .slice(0, 3),
    featuredItems,
    menuItems: availableItems,
    promotion: promotion
      ? {
          id: promotion.id,
          isEnabled: promotion.is_enabled,
          brandName: promotion.brand_name,
          headline: promotion.headline,
          description: promotion.description,
          imageUrl: promotion.image_url,
          relatedMenuItemId: promotion.related_menu_item_id,
          startsAt: promotion.starts_at,
          endsAt: promotion.ends_at,
        }
      : {
          id: null,
          isEnabled: false,
          brandName: "",
          headline: "",
          description: "",
          imageUrl: null,
          relatedMenuItemId: null,
          startsAt: null,
          endsAt: null,
        },
  };
}

export async function updateVenueQrSettingsAction(
  venueId: string,
  formData: FormData,
) {
  "use server";

  const context = await getVenuePathContext(venueId);
  const supabase = await createAdminMutationClient();
  const { error } = await supabase
    .from("venues")
    .update({
      qr_enabled: formData.get("qrEnabled") === "on",
      qr_show_nearby: formData.get("qrShowNearby") === "on",
    })
    .eq("id", venueId);

  if (error) {
    throw new Error(`Unable to update venue QR settings: ${error.message}`);
  }

  revalidateVenueQrPaths(
    venueId,
    context.venueSlug,
    context.citySlug,
  );
}

function getRequiredCopyField(
  formData: FormData,
  field: string,
  label: string,
  maxLength: number,
) {
  const value = String(formData.get(field) ?? "").trim();
  if (!value) throw new Error(`${label} no puede quedar vacío.`);
  if (value.length > maxLength) {
    throw new Error(`${label} no puede superar ${maxLength} caracteres.`);
  }
  return value;
}

function getOptionalCopyField(
  formData: FormData,
  field: string,
  label: string,
  maxLength: number,
) {
  const value = String(formData.get(field) ?? "").trim();
  if (value.length > maxLength) {
    throw new Error(`${label} no puede superar ${maxLength} caracteres.`);
  }
  return value || null;
}

export async function updateVenueQrFavoritesCopyAction(
  venueId: string,
  formData: FormData,
) {
  "use server";

  const context = await getVenuePathContext(venueId);
  const eyebrow = getRequiredCopyField(
    formData,
    "eyebrow",
    "El texto superior",
    60,
  );
  const title = getRequiredCopyField(formData, "title", "El título", 80);
  const description = getRequiredCopyField(
    formData,
    "description",
    "La descripción",
    180,
  );
  const hostName = String(formData.get("hostName") ?? "").trim();
  if (hostName.length > 60) {
    throw new Error("El nombre no puede superar 60 caracteres.");
  }
  const supabase = await createAdminMutationClient();
  const { error } = await supabase
    .from("venues")
    .update({
      qr_favorites_eyebrow: eyebrow,
      qr_favorites_title: title,
      qr_favorites_description: description,
      qr_host_name: hostName || null,
    })
    .eq("id", venueId);

  if (error) {
    throw new Error(`Unable to update QR favorites copy: ${error.message}`);
  }

  revalidateVenueQrPaths(venueId, context.venueSlug, context.citySlug);
}

export async function updateVenueQrStoryAction(
  venueId: string,
  formData: FormData,
) {
  "use server";

  const context = await getVenuePathContext(venueId);
  const heroTagline = getOptionalCopyField(
    formData,
    "heroTagline",
    "La frase de portada",
    120,
  );
  const story = getOptionalCopyField(
    formData,
    "story",
    "La historia",
    12000,
  );
  const supabase = await createAdminMutationClient();
  const { error } = await supabase
    .from("venues")
    .update({
      qr_hero_tagline: heroTagline,
      qr_story: story,
    })
    .eq("id", venueId);

  if (error) {
    throw new Error(`Unable to update venue QR story: ${error.message}`);
  }

  revalidateVenueQrPaths(venueId, context.venueSlug, context.citySlug);
}

export async function updateVenueQrHeroImageAction(
  venueId: string,
  imageUrl: string,
) {
  "use server";

  const normalizedUrl = validateImageUrl(imageUrl.trim());
  const context = await getVenuePathContext(venueId);
  const supabase = await createAdminMutationClient();
  const { error } = await supabase
    .from("venues")
    .update({ qr_hero_image_url: normalizedUrl })
    .eq("id", venueId);

  if (error) {
    throw new Error(`Unable to update venue QR hero: ${error.message}`);
  }

  await removeReplacedQrImage(
    venueId,
    context.qrHeroImageUrl,
    normalizedUrl,
  );
  revalidateVenueQrPaths(
    venueId,
    context.venueSlug,
    context.citySlug,
  );

  return { ok: true as const, imageUrl: normalizedUrl };
}

export async function prepareVenueQrImageUploadAction(
  venueId: string,
  mimeType: string,
) {
  "use server";

  await requireAuthorizedAdminSession();
  if (mimeType.toLowerCase() !== "image/webp") {
    return { ok: false as const, error: "La imagen preparada no es válida." };
  }

  await getVenuePathContext(venueId);
  const path = `venues/${venueId}/qr/${randomUUID()}.webp`;
  const supabase = await createAdminMutationClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    return { ok: false as const, error: "No se pudo preparar la subida." };
  }

  return { ok: true as const, path, signedUrl: data.signedUrl };
}

export async function finalizeVenueQrImageUploadAction(
  venueId: string,
  path: string,
) {
  "use server";

  await requireAuthorizedAdminSession();
  const expectedPrefix = `venues/${venueId}/qr/`;
  if (
    !path.startsWith(expectedPrefix) ||
    path.includes("..") ||
    !path.endsWith(".webp")
  ) {
    return { ok: false as const, error: "La ruta de la imagen no es válida." };
  }

  const context = await getVenuePathContext(venueId);
  const supabase = await createAdminMutationClient();
  const { data: file, error: downloadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .download(path);

  if (downloadError || !file) {
    return { ok: false as const, error: "No se pudo validar la imagen subida." };
  }
  if (file.size > 4 * 1024 * 1024) {
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    return { ok: false as const, error: "La imagen supera el tamaño permitido." };
  }

  const { data: publicData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path);
  const imageUrl = publicData.publicUrl;
  const { error } = await supabase
    .from("venues")
    .update({ qr_hero_image_url: imageUrl })
    .eq("id", venueId);

  if (error) {
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    return { ok: false as const, error: "No se pudo guardar la imagen del QR." };
  }

  await removeReplacedQrImage(venueId, context.qrHeroImageUrl, imageUrl);
  revalidateVenueQrPaths(
    venueId,
    context.venueSlug,
    context.citySlug,
  );
  return { ok: true as const, imageUrl };
}

export async function discardVenueQrImageUploadAction(
  venueId: string,
  path: string,
) {
  "use server";

  try {
    await requireAuthorizedAdminSession();
    if (
      !path.startsWith(`venues/${venueId}/qr/`) ||
      path.includes("..")
    ) {
      return;
    }
    const supabase = await createAdminMutationClient();
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  } catch {
    // Cleanup is best effort and must not hide the original upload error.
  }
}

export async function prepareVenueQrStoryImageUploadAction(
  venueId: string,
  mimeType: string,
) {
  "use server";

  await requireAuthorizedAdminSession();
  if (mimeType.toLowerCase() !== "image/webp") {
    return { ok: false as const, error: "La imagen preparada no es válida." };
  }

  await getVenuePathContext(venueId);
  const path = `venues/${venueId}/qr/story/${randomUUID()}.webp`;
  const supabase = await createAdminMutationClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    return { ok: false as const, error: "No se pudo preparar la subida." };
  }

  return { ok: true as const, path, signedUrl: data.signedUrl };
}

export async function finalizeVenueQrStoryImageUploadAction(
  venueId: string,
  path: string,
) {
  "use server";

  await requireAuthorizedAdminSession();
  const expectedPrefix = `venues/${venueId}/qr/story/`;
  if (
    !path.startsWith(expectedPrefix) ||
    path.includes("..") ||
    !path.endsWith(".webp")
  ) {
    return { ok: false as const, error: "La ruta de la imagen no es válida." };
  }

  const context = await getVenuePathContext(venueId);
  const supabase = await createAdminMutationClient();
  const [{ data: file, error: downloadError }, { data: venue, error: venueError }] =
    await Promise.all([
      supabase.storage.from(STORAGE_BUCKET).download(path),
      supabase
        .from("venues")
        .select("qr_story_image_urls")
        .eq("id", venueId)
        .maybeSingle(),
    ]);

  if (downloadError || !file) {
    return { ok: false as const, error: "No se pudo validar la imagen subida." };
  }
  if (venueError || !venue) {
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    return { ok: false as const, error: "No se pudo cargar el local." };
  }
  if (file.size > 4 * 1024 * 1024) {
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    return { ok: false as const, error: "La imagen supera el tamaño permitido." };
  }

  const currentUrls = (venue.qr_story_image_urls ?? [])
    .map((url) => url.trim())
    .filter(Boolean)
    .slice(0, 3);
  if (currentUrls.length >= 3) {
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    return { ok: false as const, error: "La historia ya tiene tres imágenes." };
  }

  const { data: publicData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path);
  const imageUrl = publicData.publicUrl;
  const { error } = await supabase
    .from("venues")
    .update({ qr_story_image_urls: [...currentUrls, imageUrl] })
    .eq("id", venueId);

  if (error) {
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    return { ok: false as const, error: "No se pudo guardar la imagen." };
  }

  revalidateVenueQrPaths(venueId, context.venueSlug, context.citySlug);
  return { ok: true as const, imageUrl };
}

export async function removeVenueQrStoryImageAction(
  venueId: string,
  imageUrl: string,
) {
  "use server";

  const context = await getVenuePathContext(venueId);
  const supabase = await createAdminMutationClient();
  const { data: venue, error: venueError } = await supabase
    .from("venues")
    .select("qr_story_image_urls")
    .eq("id", venueId)
    .maybeSingle();

  if (venueError || !venue) {
    throw new Error("No se pudo cargar el local.");
  }

  const currentUrls = venue.qr_story_image_urls ?? [];
  if (!currentUrls.includes(imageUrl)) return { ok: true as const };

  const { error } = await supabase
    .from("venues")
    .update({
      qr_story_image_urls: currentUrls.filter((url) => url !== imageUrl),
    })
    .eq("id", venueId);
  if (error) throw new Error("No se pudo quitar la imagen de la historia.");

  const storagePath = getManagedStoryStoragePath(imageUrl, venueId);
  if (storagePath) {
    await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
  }

  revalidateVenueQrPaths(venueId, context.venueSlug, context.citySlug);
  return { ok: true as const };
}

export async function updateVenueQrPromotionAction(
  venueId: string,
  formData: FormData,
) {
  "use server";

  const context = await getVenuePathContext(venueId);
  const isEnabled = formData.get("isEnabled") === "on";
  const brandName = String(formData.get("brandName") ?? "").trim();
  const headline = String(formData.get("headline") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const relatedMenuItemId = String(
    formData.get("relatedMenuItemId") ?? "",
  ).trim();
  const startsAt = normalizeOptionalDate(formData.get("startsAt"));
  const endsAt = normalizeOptionalDate(formData.get("endsAt"));

  if (isEnabled && (!brandName || !headline || !description)) {
    throw new Error(
      "Completa marca, titular y texto antes de activar la promoción.",
    );
  }
  if (startsAt && endsAt && startsAt > endsAt) {
    throw new Error("La fecha final debe ser posterior a la fecha inicial.");
  }

  const supabase = await createAdminMutationClient();
  if (relatedMenuItemId) {
    const { data: relatedItem, error: itemError } = await supabase
      .from("menu_items")
      .select("id")
      .eq("id", relatedMenuItemId)
      .eq("venue_id", venueId)
      .maybeSingle();
    if (itemError || !relatedItem) {
      throw new Error("El plato relacionado no pertenece a este local.");
    }
  }

  const { error } = await supabase.from("venue_qr_promotions").upsert(
    {
      venue_id: venueId,
      is_enabled: isEnabled,
      brand_name: brandName,
      headline,
      description,
      related_menu_item_id: relatedMenuItemId || null,
      starts_at: startsAt,
      ends_at: endsAt,
    },
    { onConflict: "venue_id" },
  );

  if (error) {
    throw new Error(`Unable to update venue QR promotion: ${error.message}`);
  }

  revalidateVenueQrPaths(
    venueId,
    context.venueSlug,
    context.citySlug,
  );
}

export async function updateVenueQrPromotionImageAction(
  venueId: string,
  imageUrl: string,
) {
  "use server";

  const normalizedUrl = validateImageUrl(imageUrl.trim());
  const context = await getVenuePathContext(venueId);
  const supabase = await createAdminMutationClient();
  const { data: previousPromotion } = await supabase
    .from("venue_qr_promotions")
    .select("image_url")
    .eq("venue_id", venueId)
    .maybeSingle();
  const { error } = await supabase.from("venue_qr_promotions").upsert(
    { venue_id: venueId, image_url: normalizedUrl },
    { onConflict: "venue_id" },
  );

  if (error) {
    throw new Error(`Unable to update venue QR promotion image: ${error.message}`);
  }

  await removeReplacedPromotionImage(
    venueId,
    previousPromotion?.image_url ?? null,
    normalizedUrl,
  );
  revalidateVenueQrPaths(
    venueId,
    context.venueSlug,
    context.citySlug,
  );
  return { ok: true as const, imageUrl: normalizedUrl };
}

export async function prepareVenueQrPromotionImageUploadAction(
  venueId: string,
  mimeType: string,
) {
  "use server";

  await requireAuthorizedAdminSession();
  if (mimeType.toLowerCase() !== "image/webp") {
    return { ok: false as const, error: "La imagen preparada no es válida." };
  }

  await getVenuePathContext(venueId);
  const path = `venues/${venueId}/qr/promotion/${randomUUID()}.webp`;
  const supabase = await createAdminMutationClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) {
    return { ok: false as const, error: "No se pudo preparar la subida." };
  }
  return { ok: true as const, path, signedUrl: data.signedUrl };
}

export async function finalizeVenueQrPromotionImageUploadAction(
  venueId: string,
  path: string,
) {
  "use server";

  await requireAuthorizedAdminSession();
  const expectedPrefix = `venues/${venueId}/qr/promotion/`;
  if (
    !path.startsWith(expectedPrefix) ||
    path.includes("..") ||
    !path.endsWith(".webp")
  ) {
    return { ok: false as const, error: "La ruta de la imagen no es válida." };
  }

  const context = await getVenuePathContext(venueId);
  const supabase = await createAdminMutationClient();
  const [{ data: file, error: downloadError }, { data: previousPromotion }] =
    await Promise.all([
      supabase.storage.from(STORAGE_BUCKET).download(path),
      supabase
        .from("venue_qr_promotions")
        .select("image_url")
        .eq("venue_id", venueId)
        .maybeSingle(),
    ]);

  if (downloadError || !file) {
    return { ok: false as const, error: "No se pudo validar la imagen subida." };
  }
  if (file.size > 4 * 1024 * 1024) {
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    return { ok: false as const, error: "La imagen supera el tamaño permitido." };
  }

  const { data: publicData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path);
  const imageUrl = publicData.publicUrl;
  const { error } = await supabase.from("venue_qr_promotions").upsert(
    { venue_id: venueId, image_url: imageUrl },
    { onConflict: "venue_id" },
  );

  if (error) {
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    return { ok: false as const, error: "No se pudo guardar la imagen promocional." };
  }

  await removeReplacedPromotionImage(
    venueId,
    previousPromotion?.image_url ?? null,
    imageUrl,
  );
  revalidateVenueQrPaths(
    venueId,
    context.venueSlug,
    context.citySlug,
  );
  return { ok: true as const, imageUrl };
}

export async function discardVenueQrPromotionImageUploadAction(
  venueId: string,
  path: string,
) {
  "use server";

  try {
    await requireAuthorizedAdminSession();
    if (
      !path.startsWith(`venues/${venueId}/qr/promotion/`) ||
      path.includes("..")
    ) {
      return;
    }
    const supabase = await createAdminMutationClient();
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  } catch {
    // Cleanup is best effort and must not hide the original upload error.
  }
}
