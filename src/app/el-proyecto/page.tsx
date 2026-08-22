import type { Metadata } from "next";

import { SiteShell } from "@/components/layout/site-shell";
import { ProjectPage } from "@/components/project/project-page";
import { getSiteMediaAssetMap } from "@/features/site-media/services/site-media-service";

export const metadata: Metadata = {
  title: "El proyecto",
  description:
    "Por que existe Pickyalo: una forma simple y visual de descubrir productos y platos destacados, decidir rapido y recoger en locales cercanos.",
};

export default async function ProjectRoutePage() {
  const siteMedia = await getSiteMediaAssetMap();

  return (
    <SiteShell wideContent>
      <ProjectPage
        siteMedia={{
          heroImageUrl: siteMedia.project_hero.imageUrl,
          discoverImageUrl: siteMedia.project_step_discover.imageUrl,
          chooseImageUrl: siteMedia.project_step_order.imageUrl,
          pickupImageUrl: siteMedia.project_step_pickup.imageUrl,
          outroImageUrl: siteMedia.project_idea.imageUrl,
        }}
      />
    </SiteShell>
  );
}
