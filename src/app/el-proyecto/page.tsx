import type { Metadata } from "next";

import { SiteShell } from "@/components/layout/site-shell";
import { ProjectPage } from "@/components/project/project-page";

export const metadata: Metadata = {
  title: "ZylenPick — El proyecto",
  description:
    "Landing de presentación del proyecto ZylenPick, centrada en su visión de recogida local y experiencia de marca.",
};

export default function ProjectRoutePage() {
  return (
    <SiteShell>
      <ProjectPage />
    </SiteShell>
  );
}
