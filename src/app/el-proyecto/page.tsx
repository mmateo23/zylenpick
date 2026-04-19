import type { Metadata } from "next";

import { SiteShell } from "@/components/layout/site-shell";
import { ProjectPage } from "@/components/project/project-page";
import { getSiteMediaAssetMap } from "@/features/site-media/services/site-media-service";

export const metadata: Metadata = {
  title: "ZylenPick — El proyecto",
  description:
    "Por qué existe ZylenPick: una forma más simple de elegir comida local, recoger sin complicaciones y dar más visibilidad a los locales.",
};

export default async function ProjectRoutePage() {
  const siteMedia = await getSiteMediaAssetMap();

  return (
    <SiteShell>
      <ProjectPage siteMedia={siteMedia} />
    </SiteShell>
  );
}
