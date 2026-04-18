import type { Metadata } from "next";

import { SiteShell } from "@/components/layout/site-shell";
import { ProjectPage } from "@/components/project/project-page";
import { getSiteMediaAssetMap } from "@/features/site-media/services/site-media-service";

export const metadata: Metadata = {
  title: "ZylenPick — El proyecto",
  description:
    "Landing de presentación del proyecto ZylenPick, centrada en su visión de recogida local y experiencia de marca.",
};

export default async function ProjectRoutePage() {
  const siteMedia = await getSiteMediaAssetMap();

  return (
    <SiteShell>
      <ProjectPage siteMedia={siteMedia} />
    </SiteShell>
  );
}
