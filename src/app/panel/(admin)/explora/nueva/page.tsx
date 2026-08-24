import { AdminExploreRouteForm } from "@/components/admin/admin-explore-route-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  getAdminExploreCities,
  getAdminExploreSponsors,
  saveExploreRouteAction,
} from "@/features/admin/services/explore-admin-service";

export default async function NewExploreRoutePage() {
  const [cities, sponsors] = await Promise.all([getAdminExploreCities(), getAdminExploreSponsors()]);
  return (
    <section className="space-y-5">
      <AdminPageHeader eyebrow="Pickyalo Explora" title="Nueva ruta" description="Crea primero la ruta como borrador. Después podrás añadir y ordenar sus paradas." />
      <AdminExploreRouteForm route={null} cities={cities} sponsors={sponsors} action={saveExploreRouteAction.bind(null, null)} />
    </section>
  );
}
