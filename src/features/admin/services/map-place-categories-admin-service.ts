import { revalidatePath } from "next/cache";

import type { MapPlaceCategoryDefinition } from "@/features/map-places/categories";
import { mapPlaceIconOptions } from "@/features/map-places/icons";
import { requireAuthorizedAdminSession } from "@/features/admin/services/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getAdminMapPlaceCategories(): Promise<MapPlaceCategoryDefinition[]> {
  await requireAuthorizedAdminSession();
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("map_place_categories")
    .select("slug, name, icon_name, is_active, sort_order")
    .order("sort_order")
    .order("name");

  if (error) throw new Error(`No se pudieron cargar las categorías: ${error.message}`);

  return data.map((category) => ({
    value: category.slug,
    label: category.name,
    shortLabel: category.name,
    iconName: category.icon_name,
    isActive: category.is_active,
    sortOrder: category.sort_order,
  }));
}

export async function saveMapPlaceCategoryAction(formData: FormData) {
  "use server";
  await requireAuthorizedAdminSession();

  const originalSlug = String(formData.get("originalSlug") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slug = normalizeSlug(String(formData.get("slug") ?? name));
  const iconName = String(formData.get("iconName") ?? "MapPin").trim();
  const sortOrderValue = Number(formData.get("sortOrder") ?? 100);
  const sortOrder = Number.isInteger(sortOrderValue) ? sortOrderValue : 100;
  const isActive = formData.get("isActive") === "on";

  if (!name || name.length > 80) throw new Error("Indica un nombre de hasta 80 caracteres.");
  if (!slug) throw new Error("Indica un slug válido.");
  if (!mapPlaceIconOptions.includes(iconName)) throw new Error("Selecciona un icono disponible.");

  const supabase = createSupabaseAdminClient();
  const payload = {
    slug,
    name,
    icon_name: iconName,
    sort_order: sortOrder,
    is_active: isActive,
  };

  const result = originalSlug
    ? await supabase.from("map_place_categories").update(payload).eq("slug", originalSlug)
    : await supabase.from("map_place_categories").insert(payload);

  if (result.error) throw new Error(`No se pudo guardar la categoría: ${result.error.message}`);

  revalidatePath("/panel/lugares");
  revalidatePath("/panel/lugares/categorias");
  revalidatePath("/mapa");
}
