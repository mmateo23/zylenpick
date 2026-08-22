import {
  ProjectScrollSlider,
  type ProjectScrollSliderMedia,
} from "@/components/project/project-scroll-slider";
import type { SiteMediaAssetMap } from "@/features/site-media/site-media";

type ProjectPageProps = {
  siteMedia?: ProjectScrollSliderMedia | SiteMediaAssetMap;
};

export function ProjectPage({ siteMedia }: ProjectPageProps = {}) {
  const media = siteMedia && "project_hero" in siteMedia
    ? {
        heroImageUrl: siteMedia.project_hero.imageUrl,
        discoverImageUrl: siteMedia.project_step_discover.imageUrl,
        chooseImageUrl: siteMedia.project_step_order.imageUrl,
        pickupImageUrl: siteMedia.project_step_pickup.imageUrl,
        outroImageUrl: siteMedia.project_idea.imageUrl,
      }
    : siteMedia;

  return <ProjectScrollSlider media={media} />;
}
