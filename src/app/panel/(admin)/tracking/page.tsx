import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TrackingLinkGenerator } from "@/components/admin/tracking-link-generator";

export default function AdminTrackingPage() {
  return (
    <section className="space-y-5">
      <AdminPageHeader
        eyebrow="Contenido · Medición"
        title="Enlaces con tracking"
        description="Crea un enlace o QR distinto para cada campaña y descubre qué visitas terminan en platos, cesta o pedido."
      />
      <TrackingLinkGenerator />
    </section>
  );
}
