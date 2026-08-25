import { notFound } from "next/navigation";

import { AdminMenuItemForm } from "@/components/admin/admin-menu-item-form";
import { SafeDeleteButton } from "@/components/admin/safe-delete-button";
import {
  deleteMenuItemAction,
  getAdminMenuItemById,
  requireAdminVenueContext,
  updateMenuItemAction,
} from "@/features/admin/services/menu-items-admin-service";
import { getAdminVenuePublicHref } from "@/features/admin/services/venues-admin-service";

type AdminMenuItemEditPageProps = {
  params: {
    venueId: string;
    menuItemId: string;
  };
};

export default async function AdminMenuItemEditPage({
  params,
}: AdminMenuItemEditPageProps) {
  const [venue, menuItem, venuePreviewHref] = await Promise.all([
    requireAdminVenueContext(params.venueId),
    getAdminMenuItemById(params.venueId, params.menuItemId),
    getAdminVenuePublicHref(params.venueId),
  ]);

  if (!menuItem) {
    notFound();
  }

  const updateAction = updateMenuItemAction.bind(
    null,
    params.venueId,
    params.menuItemId,
  );
  const deleteAction = deleteMenuItemAction.bind(
    null,
    params.venueId,
    params.menuItemId,
  );

  return (
    <div className="space-y-6">
      <AdminMenuItemForm
        title="Editar plato"
        description="Actualiza nombre, precio, visibilidad y destacado del plato desde el panel."
        submitLabel="Guardar cambios"
        action={updateAction}
        venue={venue}
        initialValues={menuItem}
        previewHref={
          venuePreviewHref
            ? `${venuePreviewHref}#plato-${params.menuItemId}`
            : null
        }
      />
      <SafeDeleteButton
        action={deleteAction}
        entityLabel="este plato"
        redirectTo={`/panel/locales/${params.venueId}/platos`}
      />
    </div>
  );
}
