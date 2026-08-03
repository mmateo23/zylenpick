import { AdminMapPlaceForm } from "@/components/admin/admin-map-place-form";
import {
  createMapPlaceAction,
  getMapPlaceCities,
} from "@/features/admin/services/map-places-admin-service";

export default async function NewMapPlacePage() {
  const cities = await getMapPlaceCities();
  return (
    <AdminMapPlaceForm
      accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ""}
      cities={cities}
      action={createMapPlaceAction}
    />
  );
}
