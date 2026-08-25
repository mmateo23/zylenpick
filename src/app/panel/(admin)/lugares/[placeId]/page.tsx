import { notFound } from "next/navigation";

import { AdminMapPlaceForm } from "@/components/admin/admin-map-place-form";
import { SafeDeleteButton } from "@/components/admin/safe-delete-button";
import {
  deleteMapPlaceAction,
  getAdminMapPlaceById,
  getMapPlaceCities,
  getMapPlaceParentOptions,
  updateMapPlaceAction,
} from "@/features/admin/services/map-places-admin-service";
import { getAdminMapPlaceCategories } from "@/features/admin/services/map-place-categories-admin-service";

type EditMapPlacePageProps = { params: { placeId: string } };

export default async function EditMapPlacePage({ params }: EditMapPlacePageProps) {
  const [cities, parentPlaces, categories, place] = await Promise.all([
    getMapPlaceCities(),
    getMapPlaceParentOptions(),
    getAdminMapPlaceCategories(),
    getAdminMapPlaceById(params.placeId),
  ]);
  if (!place) notFound();
  const action = updateMapPlaceAction.bind(null, params.placeId);
  const deleteAction = deleteMapPlaceAction.bind(null, params.placeId);

  return (
    <div className="space-y-6">
      <AdminMapPlaceForm
        accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ""}
        cities={cities}
        parentPlaces={parentPlaces}
        categories={categories.filter((category) => category.isActive || category.value === place.category)}
        initialValues={place}
        action={action}
        mode="edit"
      />
      <SafeDeleteButton
        action={deleteAction}
        entityLabel="este lugar"
        redirectTo="/panel/lugares"
      />
    </div>
  );
}
