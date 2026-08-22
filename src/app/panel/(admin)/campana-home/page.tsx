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
        eyebrow="Contenido"
        title="Campaña de Home"
        description="Crea una pieza especial para un evento o colaboración y comprueba su aspecto antes de activarla."
      />
      <HomeCampaignEditor
        action={updateHomeCampaignAction}
        initialCampaign={design.texts.homeCampaign}
      />
    </section>
  );
}
