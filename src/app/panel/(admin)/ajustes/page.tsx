import { BadgeEuro, Palette } from "lucide-react";

import { AdminHubCard } from "@/components/admin/admin-hub-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

const settingsAreas = [
  {
    href: "/panel/diseno",
    icon: Palette,
    title: "Textos y diseño",
    description: "Ajusta mensajes, fondos y etiquetas globales de la web.",
  },
  {
    href: "/panel/monetizacion",
    icon: BadgeEuro,
    title: "Planes y visibilidad",
    description: "Gestiona el nivel de ayuda y las capacidades de cada local.",
  },
];

export default function AdminSettingsPage() {
  return (
    <section className="space-y-5">
      <AdminPageHeader
        eyebrow="Ajustes"
        title="Configuración sin ruido."
        description="Opciones globales que se cambian con menos frecuencia."
      />
      <div className="grid max-w-4xl gap-3 sm:grid-cols-2">
        {settingsAreas.map((area) => (
          <AdminHubCard key={area.href} {...area} />
        ))}
      </div>
    </section>
  );
}
