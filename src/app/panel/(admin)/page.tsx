import Link from "next/link";
import { Building2, Camera, Clock3, Compass, Images, Inbox, MapPin, PanelsTopLeft, Settings2 } from "lucide-react";
import { AdminHubCard } from "@/components/admin/admin-hub-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminDashboardSummary } from "@/features/admin/services/dashboard-service";

export default async function AdminDashboardPage() {
  const summary = await getAdminDashboardSummary();
  const stats = [
    ["Fichas activas y publicadas", summary.publishedVenuesCount],
    ["Productos en catálogo", summary.menuItemsCount],
    ["Productos agotados", summary.unavailableMenuItemsCount],
    ["Locales registrados", summary.venuesCount],
  ] as const;
  return <section className="space-y-6">
    <AdminPageHeader eyebrow="Inicio" title="Gestionar Pickyalo." description="Fichas, imágenes, rutas y contenido. Entra directamente en lo que necesitas editar." />
    <nav aria-label="Herramientas de gestión" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {[
        { title: "Locales y productos", description: "Editar fichas, fotos y productos de cada local.", href: "/panel/locales", icon: Building2 },
        { title: "Imágenes de la web", description: "Cambiar las imágenes de la Home y otras páginas.", href: "/panel/imagenes?page=home", icon: Images },
        { title: "Explora", description: "Gestionar rutas, puntos y experiencias culturales.", href: "/panel/explora", icon: Compass },
        { title: "Lugares del mapa", description: "Añadir y revisar monumentos y servicios.", href: "/panel/lugares", icon: MapPin },
        { title: "Scout", description: "Capturar nuevos lugares mientras recorres la ciudad.", href: "/panel/scout", icon: Camera },
        { title: "Contenido", description: "Destacados, shots, etiquetas y campañas.", href: "/panel/contenido", icon: PanelsTopLeft },
        { title: "Horarios", description: "Revisar la apertura y los horarios de los locales.", href: "/panel/locales?vista=horarios", icon: Clock3 },
        { title: "Solicitudes", description: "Revisar los comercios que quieren participar.", href: "/panel/solicitudes", icon: Inbox },
        { title: "Ajustes", description: "Acceder a los textos, diseño y configuración existentes.", href: "/panel/ajustes", icon: Settings2 },
      ].map((area) => <AdminHubCard key={area.href} {...area} />)}
    </nav>
    <h2 className="text-xl font-semibold text-[#741314]">Estado del catálogo</h2>
    <div className="grid gap-4 sm:grid-cols-2">
      {stats.map(([label,value]) => <article key={label} className="rounded-2xl border border-[#741314]/15 bg-[#FFF7E8] p-6">
        <p className="text-sm font-semibold text-[#694b3d]">{label}</p>
        <p className="mt-3 text-5xl font-bold text-[#741314]">{value ?? "—"}</p>
      </article>)}
    </div>
    <p className="text-sm text-[#694b3d]">Estas cifras describen el catálogo; las visitas y los clics se siguen midiendo en PostHog.</p>
    <Link href="/panel/locales" className="inline-flex min-h-12 items-center rounded-full bg-[#741314] px-6 font-bold text-[#FFF7E8]">Cuidar las fichas</Link>
  </section>;
}
