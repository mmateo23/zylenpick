"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import {
  createAdminDataClient,
  createAdminMutationClient,
  requireAuthorizedAdminSession,
} from "@/features/admin/services/admin-auth";
import {
  getDefaultSiteMediaAssetMap,
  siteMediaAssetDefinitions,
  type SiteMediaAssetKey,
  type SiteMediaPageKey,
} from "@/features/site-media/site-media";

const STORAGE_BUCKET = "pickyalo-media";

export type AdminMediaCityItem = {
  id: string;
  name: string;
  slug: string;
  heroImageUrl: string | null;
  heroVideoUrl: string | null;
};

export type AdminMediaVenueItem = {
  id: string;
  name: string;
  slug: string;
  coverUrl: string | null;
  logoUrl: string | null;
};

export type AdminSiteMediaAssetItem = {
  key: SiteMediaAssetKey;
  page: SiteMediaPageKey;
  slot: string;
  label: string;
  description: string;
  recommendedSize: string;
  imageUrl: string;
};

function revalidateMediaPaths(citySlug: string, venueSlug?: string) {
  revalidatePath("/");
  revalidatePath("/zonas");
  revalidatePath(`/zonas/${citySlug}`);
  revalidatePath("/unete");
  revalidatePath("/el-proyecto");
  revalidatePath("/panel/imagenes");
  revalidatePath("/demo/zonas");
  revalidatePath(`/demo/zonas/${citySlug}`);

  if (venueSlug) {
    revalidatePath(`/zonas/${citySlug}/venues/${venueSlug}`);
  }
}

function isMissingCityHeroVideoColumnError(message: string) {
  return message.toLowerCase().includes("hero_video_url");
}

export async function getAdminSiteMediaAssets(): Promise<AdminSiteMediaAssetItem[]> {
  const fallbackMap = getDefaultSiteMediaAssetMap();
  const supabase = await createAdminDataClient();
  const { data, error } = await supabase
    .from("site_media_assets")
    .select("key, image_url");

  if (!error) {
    for (const row of data) {
      const definition = siteMediaAssetDefinitions.find(
        (asset) => asset.key === row.key,
      );

      if (!definition) {
        continue;
      }

      fallbackMap[definition.key] = {
        key: definition.key,
        label: definition.label,
        description: definition.description,
        imageUrl: row.image_url?.trim() || definition.defaultImageUrl,
      };
    }
  }

  return siteMediaAssetDefinitions.map((asset) => ({
    key: asset.key,
    page: asset.page,
    slot: asset.slot,
    label: asset.label,
    description: asset.description,
    recommendedSize: asset.recommendedSize,
    imageUrl: fallbackMap[asset.key].imageUrl,
  }));
}

function revalidateSiteMediaPaths() {
  revalidatePath("/");
  revalidatePath("/platos");
  revalidatePath("/mapa");
  revalidatePath("/unete");
  revalidatePath("/el-proyecto");
  revalidatePath("/cart");
  revalidatePath("/panel/imagenes");
}

export async function getAdminMediaCities(): Promise<AdminMediaCityItem[]> {
  const supabase = await createAdminDataClient();
  const { data, error } = await supabase
    .from("cities")
    .select("id, name, slug, hero_image_url, hero_video_url")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error && isMissingCityHeroVideoColumnError(error.message)) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("cities")
      .select("id, name, slug, hero_image_url")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (fallbackError) {
      throw new Error(`Unable to load admin media cities: ${fallbackError.message}`);
    }

    return fallbackData.map((city) => ({
      id: city.id,
      name: city.name,
      slug: city.slug,
      heroImageUrl: city.hero_image_url,
      heroVideoUrl: null,
    }));
  }

  if (error) {
    throw new Error(`Unable to load admin media cities: ${error.message}`);
  }

  return data.map((city) => ({
    id: city.id,
    name: city.name,
    slug: city.slug,
    heroImageUrl: city.hero_image_url,
    heroVideoUrl: city.hero_video_url ?? null,
  }));
}

export async function getAdminMediaCityById(
  cityId: string,
): Promise<AdminMediaCityItem | null> {
  const supabase = await createAdminDataClient();
  const { data, error } = await supabase
    .from("cities")
    .select("id, name, slug, hero_image_url, hero_video_url")
    .eq("id", cityId)
    .maybeSingle();

  if (error && isMissingCityHeroVideoColumnError(error.message)) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("cities")
      .select("id, name, slug, hero_image_url")
      .eq("id", cityId)
      .maybeSingle();

    if (fallbackError) {
      throw new Error(`Unable to load admin media city: ${fallbackError.message}`);
    }

    if (!fallbackData) {
      return null;
    }

    return {
      id: fallbackData.id,
      name: fallbackData.name,
      slug: fallbackData.slug,
      heroImageUrl: fallbackData.hero_image_url,
      heroVideoUrl: null,
    };
  }

  if (error) {
    throw new Error(`Unable to load admin media city: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    heroImageUrl: data.hero_image_url,
    heroVideoUrl: data.hero_video_url ?? null,
  };
}

export async function getAdminVenueMediaByCityId(
  cityId: string,
): Promise<AdminMediaVenueItem[]> {
  const supabase = await createAdminDataClient();
  const { data, error } = await supabase
    .from("venues")
    .select("id, name, slug, cover_url, logo_url")
    .eq("city_id", cityId)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load admin venue media: ${error.message}`);
  }

  return data.map((venue) => ({
    id: venue.id,
    name: venue.name,
    slug: venue.slug,
    coverUrl: venue.cover_url,
    logoUrl: venue.logo_url,
  }));
}

export async function updateCityHeroMediaAction(
  cityId: string,
  formData: FormData,
) {
  "use server";

  const heroImageUrl = String(formData.get("heroImageUrl") ?? "").trim();
  const heroVideoUrl = String(formData.get("heroVideoUrl") ?? "").trim();
  const city = await getAdminMediaCityById(cityId);

  if (!city) {
    throw new Error("No hemos encontrado la ciudad seleccionada.");
  }

  const supabase = await createAdminMutationClient();
  const { error } = await supabase
    .from("cities")
    .update({
      hero_image_url: heroImageUrl || null,
      hero_video_url: heroVideoUrl || null,
    })
    .eq("id", cityId);

  if (error && isMissingCityHeroVideoColumnError(error.message)) {
    const { error: fallbackError } = await supabase
      .from("cities")
      .update({
        hero_image_url: heroImageUrl || null,
      })
      .eq("id", cityId);

    if (fallbackError) {
      throw new Error(`Unable to update city hero media: ${fallbackError.message}`);
    }

    revalidateMediaPaths(city.slug);
    return;
  }

  if (error) {
    throw new Error(`Unable to update city hero media: ${error.message}`);
  }

  revalidateMediaPaths(city.slug);
}

export async function updateVenueMediaAction(
  venueId: string,
  formData: FormData,
) {
  "use server";

  const coverUrl = String(formData.get("coverUrl") ?? "").trim();
  const logoUrl = String(formData.get("logoUrl") ?? "").trim();
  const supabase = await createAdminDataClient();
  const { data: venueData, error: venueError } = await supabase
    .from("venues")
    .select("slug, cities!inner(slug)")
    .eq("id", venueId)
    .maybeSingle();

  if (venueError) {
    throw new Error(`Unable to load venue media path: ${venueError.message}`);
  }

  if (!venueData) {
    throw new Error("No hemos encontrado el local seleccionado.");
  }

  const adminSupabase = await createAdminMutationClient();
  const { error } = await adminSupabase
    .from("venues")
    .update({
      cover_url: coverUrl || null,
      logo_url: logoUrl || null,
    })
    .eq("id", venueId);

  if (error) {
    throw new Error(`Unable to update venue media: ${error.message}`);
  }

  revalidateMediaPaths(venueData.cities.slug, venueData.slug);
}

export async function updateSiteMediaAssetAction(
  assetKey: SiteMediaAssetKey,
  formData: FormData,
) {
  "use server";

  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const assetDefinition = siteMediaAssetDefinitions.find(
    (asset) => asset.key === assetKey,
  );

  if (!assetDefinition) {
    throw new Error("No hemos encontrado la imagen global seleccionada.");
  }

  const adminSupabase = await createAdminMutationClient();
  const { error } = await adminSupabase.from("site_media_assets").upsert(
    {
      key: assetDefinition.key,
      label: assetDefinition.label,
      description: assetDefinition.description,
      image_url: imageUrl || null,
    },
    { onConflict: "key" },
  );

  if (error) {
    throw new Error(`Unable to update site media asset: ${error.message}`);
  }

  revalidateSiteMediaPaths();
}

export async function prepareSiteMediaUploadAction(
  assetKey: SiteMediaAssetKey,
  mimeType: string,
) {
  "use server";

  await requireAuthorizedAdminSession();
  const assetDefinition = siteMediaAssetDefinitions.find(
    (asset) => asset.key === assetKey,
  );

  if (!assetDefinition || mimeType.toLowerCase() !== "image/webp") {
    return { ok: false as const, error: "La imagen preparada no es válida." };
  }

  const path = `site-media/${assetKey}/${randomUUID()}.webp`;
  const supabase = await createAdminMutationClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    return { ok: false as const, error: "No se pudo preparar la subida." };
  }

  return {
    ok: true as const,
    path,
    signedUrl: data.signedUrl,
  };
}

export async function finalizeSiteMediaUploadAction(
  assetKey: SiteMediaAssetKey,
  path: string,
) {
  "use server";

  await requireAuthorizedAdminSession();
  const assetDefinition = siteMediaAssetDefinitions.find(
    (asset) => asset.key === assetKey,
  );
  const expectedPrefix = `site-media/${assetKey}/`;

  if (
    !assetDefinition ||
    !path.startsWith(expectedPrefix) ||
    path.includes("..") ||
    !path.toLowerCase().endsWith(".webp")
  ) {
    return { ok: false as const, error: "La ruta de la imagen no es válida." };
  }

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
  const { error } = await supabase.from("site_media_assets").upsert(
    {
      key: assetDefinition.key,
      label: assetDefinition.label,
      description: assetDefinition.description,
      image_url: imageUrl,
    },
    { onConflict: "key" },
  );

  if (error) {
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    return { ok: false as const, error: "No se pudo guardar la nueva imagen." };
  }

  revalidateSiteMediaPaths();
  return { ok: true as const, imageUrl };
}

export async function discardSiteMediaUploadAction(path: string) {
  "use server";

  try {
    await requireAuthorizedAdminSession();
    if (!path.startsWith("site-media/") || path.includes("..")) {
      return;
    }

    const supabase = await createAdminMutationClient();
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  } catch {
    // Cleanup is best effort and must not hide the original upload error.
  }
}
