import type { Metadata } from "next";

import { SiteShell } from "@/components/layout/site-shell";
import { ProjectPage } from "@/components/project/project-page";
import { getSiteMediaAssetMap } from "@/features/site-media/services/site-media-service";

export const metadata: Metadata = {
  title: "El proyecto | ZylenPick",
  description:
    "Por qué existe ZylenPick: una forma simple y visual de ver platos reales, decidir rápido y recoger en locales cercanos.",
};

export default async function ProjectRoutePage() {
  const siteMedia = await getSiteMediaAssetMap();

  return (
    <SiteShell>
      <ProjectPage siteMedia={siteMedia} />
    </SiteShell>
  );
}
