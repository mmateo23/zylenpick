import { notFound } from "next/navigation";

import { AdminMenuItemForm } from "@/components/admin/admin-menu-item-form";
import {
  getAdminMenuItemById,
  requireAdminVenueContext,
  updateMenuItemAction,
} from "@/features/admin/services/menu-items-admin-service";

type AdminMenuItemEditPageProps = {
  params: {
    venueId: string;
    menuItemId: string;
  };
};

export default async function AdminMenuItemEditPage({
  params,
}: AdminMenuItemEditPageProps) {
  const [venue, menuItem] = await Promise.all([
    requireAdminVenueContext(params.venueId),
    getAdminMenuItemById(params.venueId, params.menuItemId),
  ]);

  if (!menuItem) {
    notFound();
  }

  const updateAction = updateMenuItemAction.bind(
    null,
    params.venueId,
    params.menuItemId,
  );

  return (
    <AdminMenuItemForm
      title="Editar plato"
      description="Actualiza nombre, precio, visibilidad y destacado del plato desde el panel."
      submitLabel="Guardar cambios"
      action={updateAction}
      venue={venue}
      initialValues={menuItem}
    />
  );
}
