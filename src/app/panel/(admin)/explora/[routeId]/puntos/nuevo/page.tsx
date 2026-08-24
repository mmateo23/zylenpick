import { notFound } from "next/navigation";

import { AdminExplorePointForm } from "@/components/admin/admin-explore-point-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  getAdminExplorePlaceOptions,
  getAdminExplorePoints,
  getAdminExploreRouteById,
  getAdminExploreSponsors,
  saveExplorePointAction,
} from "@/features/admin/services/explore-admin-service";

export default async function NewExplorePointPage({ params }: { params: { routeId: string } }) {
  const [route, points, places, sponsors] = await Promise.all([getAdminExploreRouteById(params.routeId), getAdminExplorePoints(params.routeId), getAdminExplorePlaceOptions(), getAdminExploreSponsors()]);
  if (!route) notFound();
  const nextPosition = Math.max(0, ...points.map((point) => Number(point.position))) + 1;
  return <section className="space-y-5"><AdminPageHeader eyebrow={route.name} title="Nueva parada" description="Asocia un lugar real y prepara su experiencia. Puedes guardarla incompleta mientras siga como borrador." /><AdminExplorePointForm routeId={route.id} routeCityId={route.cityId} point={null} places={places} sponsors={sponsors} nextPosition={nextPosition} action={saveExplorePointAction.bind(null, route.id, null)} /></section>;
}
