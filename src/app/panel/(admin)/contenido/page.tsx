import { FileImage, PanelTop, Sparkles, Tags } from "lucide-react";

import { AdminHubCard } from "@/components/admin/admin-hub-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

const contentAreas = [
  {
    href: "/panel/destacados",
    icon: Sparkles,
    title: "Selecciones",
    description: "Elige qué locales y productos reciben mayor visibilidad.",
  },
  {
    href: "/panel/chips",
    icon: Tags,
    title: "Etiquetas",
    description: "Crea señales editoriales o temporales y decide cuándo aparecen.",
  },
  {
    href: "/panel/imagenes",
    icon: FileImage,
    title: "Imágenes",
    description: "Revisa portadas, logos y medios globales desde un único acceso.",
  },
  {
    href: "/panel/funnel",
    icon: PanelTop,
    title: "Recorrido de platos",
    description: "Configura las ayudas para decidir y los productos destacados del feed.",
  },
];

export default function AdminContentPage() {
  return (
    <section className="space-y-5">
      <AdminPageHeader
        eyebrow="Contenido"
        title="Qué quieres mostrar."
        description="Gestiona la visibilidad de Pickyalo sin entrar en configuraciones técnicas."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {contentAreas.map((area) => (
          <AdminHubCard key={area.href} {...area} />
        ))}
      </div>
    </section>
  );
}
