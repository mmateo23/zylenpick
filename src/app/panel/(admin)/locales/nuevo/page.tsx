import { AdminVenueForm } from "@/components/admin/admin-venue-form";
import { getAdminJoinRequestById } from "@/features/admin/services/join-requests-admin-service";
import {
  buildVenueInitialValuesFromJoinRequest,
  createVenueAction,
  getAdminCities,
} from "@/features/admin/services/venues-admin-service";

type NewAdminVenuePageProps = {
  searchParams?: {
    requestId?: string;
  };
};

export default async function NewAdminVenuePage({
  searchParams,
}: NewAdminVenuePageProps) {
  const cities = await getAdminCities();
  const requestId = searchParams?.requestId;
  const joinRequest = requestId
    ? await getAdminJoinRequestById(requestId)
    : null;

  return (
    <AdminVenueForm
      title="Crear local"
      description="Añade un nuevo local al catálogo centralizado del MVP."
      submitLabel="Guardar local"
      action={createVenueAction}
      cities={cities}
      initialValues={
        joinRequest
          ? buildVenueInitialValuesFromJoinRequest(cities, {
              id: joinRequest.id,
              venueName: joinRequest.venueName,
              businessType: joinRequest.businessType,
              area: joinRequest.area,
              address: joinRequest.address,
              venuePhone: joinRequest.venuePhone,
              venueEmail: joinRequest.venueEmail,
              website: joinRequest.website,
              contactName: joinRequest.contactName,
              contactPhone: joinRequest.contactPhone,
              contactEmail: joinRequest.contactEmail,
              serviceType: joinRequest.serviceType,
              message: joinRequest.message,
            })
          : undefined
      }
      requestContext={
        joinRequest
          ? {
              id: joinRequest.id,
              venueName: joinRequest.venueName,
              businessType: joinRequest.businessType,
              area: joinRequest.area,
              address: joinRequest.address,
              venuePhone: joinRequest.venuePhone,
              venueEmail: joinRequest.venueEmail,
              website: joinRequest.website,
              contactName: joinRequest.contactName,
              contactPhone: joinRequest.contactPhone,
              contactEmail: joinRequest.contactEmail,
              serviceType: joinRequest.serviceType,
              message: joinRequest.message,
            }
          : null
      }
    />
  );
}
