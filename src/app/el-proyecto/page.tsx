import type { Metadata } from "next";

import { SiteShell } from "@/components/layout/site-shell";
import { ZylenPickFooter } from "@/components/layout/zylenpick-footer";
import { ProjectPage } from "@/components/project/project-page";

export const metadata: Metadata = {
  title: "El proyecto | Pickyalo",
  description:
    "Por que existe Pickyalo: una forma simple y visual de descubrir productos y platos destacados, decidir rapido y recoger en locales cercanos.",
};

export default async function ProjectRoutePage() {
  return (
    <SiteShell showBasicFooter={false} wideContent>
      <ProjectPage />
      <div className="mt-6">
        <ZylenPickFooter />
      </div>
    </SiteShell>
  );
}
