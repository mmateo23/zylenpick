import { HomeCampaignEditor } from "@/components/admin/home-campaign-editor";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  getAdminSiteDesignConfig,
  updateHomeCampaignAction,
} from "@/features/admin/services/design-admin-service";

export default async function AdminHomeCampaignPage() {
  const design = await getAdminSiteDesignConfig();

  return (
    <section className="space-y-5">
      <AdminPageHeader
        eyebrow="Destacados"
        title="Un evento en la portada."
        description="La agenda entra en la cabecera cuando hay un evento activo. Elige la imagen, el texto y las fechas."
      />
      <HomeCampaignEditor
        action={updateHomeCampaignAction}
        initialCampaign={design.texts.homeCampaign}
      />
    </section>
  );
}
