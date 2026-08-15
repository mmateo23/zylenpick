import { notFound } from "next/navigation";

import { AdminMapPlaceForm } from "@/components/admin/admin-map-place-form";
import {
  createMapPlaceAction,
  getAdminMapPlaceCopyValues,
  getMapPlaceCities,
  getMapPlaceParentOptions,
} from "@/features/admin/services/map-places-admin-service";

type NewMapPlacePageProps = {
  searchParams?: {
    copiar?: string;
    parent?: string;
  };
};

export default async function NewMapPlacePage({ searchParams }: NewMapPlacePageProps) {
  const copyId = searchParams?.copiar?.trim() || null;
  const parentId = searchParams?.parent?.trim() || undefined;
  const [cities, parentPlaces, copyValues] = await Promise.all([
    getMapPlaceCities(),
    getMapPlaceParentOptions(),
    copyId ? getAdminMapPlaceCopyValues(copyId) : Promise.resolve(null),
  ]);

  if (copyId && !copyValues) notFound();

  return (
    <AdminMapPlaceForm
      accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ""}
      cities={cities}
      parentPlaces={parentPlaces}
      action={createMapPlaceAction}
      initialValues={copyValues}
      initialParentId={parentId}
      mode={copyValues ? "duplicate" : "create"}
    />
  );
}
