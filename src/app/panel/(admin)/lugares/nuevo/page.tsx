import { notFound } from "next/navigation";

import { AdminMapPlaceForm } from "@/components/admin/admin-map-place-form";
import {
  createMapPlaceAction,
  getAdminMapPlaceCopyValues,
  getMapPlaceCities,
} from "@/features/admin/services/map-places-admin-service";

type NewMapPlacePageProps = {
  searchParams?: {
    copiar?: string;
  };
};

export default async function NewMapPlacePage({ searchParams }: NewMapPlacePageProps) {
  const copyId = searchParams?.copiar?.trim() || null;
  const [cities, copyValues] = await Promise.all([
    getMapPlaceCities(),
    copyId ? getAdminMapPlaceCopyValues(copyId) : Promise.resolve(null),
  ]);

  if (copyId && !copyValues) notFound();

  return (
    <AdminMapPlaceForm
      accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ""}
      cities={cities}
      action={createMapPlaceAction}
      initialValues={copyValues}
      mode={copyValues ? "duplicate" : "create"}
    />
  );
}
