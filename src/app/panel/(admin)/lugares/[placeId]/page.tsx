import { notFound } from "next/navigation";

import { AdminMapPlaceForm } from "@/components/admin/admin-map-place-form";
import {
  getAdminMapPlaceById,
  getMapPlaceCities,
  updateMapPlaceAction,
} from "@/features/admin/services/map-places-admin-service";

type EditMapPlacePageProps = { params: { placeId: string } };

export default async function EditMapPlacePage({ params }: EditMapPlacePageProps) {
  const [cities, place] = await Promise.all([
    getMapPlaceCities(),
    getAdminMapPlaceById(params.placeId),
  ]);
  if (!place) notFound();
  const action = updateMapPlaceAction.bind(null, params.placeId);

  return (
    <AdminMapPlaceForm
      accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ""}
      cities={cities}
      initialValues={place}
      action={action}
    />
  );
}
