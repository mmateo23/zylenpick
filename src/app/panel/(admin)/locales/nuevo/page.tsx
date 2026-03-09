import { AdminVenueForm } from "@/components/admin/admin-venue-form";
import {
  createVenueAction,
  getAdminCities,
} from "@/features/admin/services/venues-admin-service";

export default async function NewAdminVenuePage() {
  const cities = await getAdminCities();

  return (
    <AdminVenueForm
      title="Crear local"
      description="Añade un nuevo local al catálogo centralizado del MVP."
      submitLabel="Guardar local"
      action={createVenueAction}
      cities={cities}
    />
  );
}
