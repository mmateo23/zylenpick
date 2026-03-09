import { AdminMenuItemForm } from "@/components/admin/admin-menu-item-form";
import {
  createMenuItemAction,
  requireAdminVenueContext,
} from "@/features/admin/services/menu-items-admin-service";

type NewAdminMenuItemPageProps = {
  params: {
    venueId: string;
  };
};

export default async function NewAdminMenuItemPage({
  params,
}: NewAdminMenuItemPageProps) {
  const venue = await requireAdminVenueContext(params.venueId);
  const createAction = createMenuItemAction.bind(null, params.venueId);

  return (
    <AdminMenuItemForm
      title="Crear plato"
      description="Añade un plato nuevo al menú del local sin salir del panel centralizado."
      submitLabel="Guardar plato"
      action={createAction}
      venue={venue}
    />
  );
}
