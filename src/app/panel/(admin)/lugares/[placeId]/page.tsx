import { notFound } from "next/navigation";

import { AdminMapPlaceForm } from "@/components/admin/admin-map-place-form";
import {
  getAdminMapPlaceById,
  getMapPlaceCities,
  getMapPlaceParentOptions,
  updateMapPlaceAction,
} from "@/features/admin/services/map-places-admin-service";

type EditMapPlacePageProps = { params: { placeId: string } };

export default async function EditMapPlacePage({ params }: EditMapPlacePageProps) {
  const [cities, parentPlaces, place] = await Promise.all([
    getMapPlaceCities(),
    getMapPlaceParentOptions(),
    getAdminMapPlaceById(params.placeId),
  ]);
  if (!place) notFound();
  const action = updateMapPlaceAction.bind(null, params.placeId);

  return (
    <AdminMapPlaceForm
      accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ""}
      cities={cities}
      parentPlaces={parentPlaces}
      initialValues={place}
      action={action}
      mode="edit"
    />
  );
}
