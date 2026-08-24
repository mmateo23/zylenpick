import { notFound } from "next/navigation";

import { AdminExplorePointForm } from "@/components/admin/admin-explore-point-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  getAdminExplorePlaceOptions,
  getAdminExplorePointById,
  getAdminExploreRouteById,
  getAdminExploreSponsors,
  saveExplorePointAction,
} from "@/features/admin/services/explore-admin-service";

export default async function EditExplorePointPage({ params }: { params: { routeId: string; pointId: string } }) {
  const [route, point, places, sponsors] = await Promise.all([getAdminExploreRouteById(params.routeId), getAdminExplorePointById(params.routeId, params.pointId), getAdminExplorePlaceOptions(), getAdminExploreSponsors()]);
  if (!route || !point) notFound();
  return <section className="space-y-5"><AdminPageHeader eyebrow={route.name} title={point.title} description="Edita el relato, medios y publicación de esta parada." /><AdminExplorePointForm routeId={route.id} routeCityId={route.cityId} point={point} places={places} sponsors={sponsors} nextPosition={Number(point.position)} action={saveExplorePointAction.bind(null, route.id, point.id)} /></section>;
}
