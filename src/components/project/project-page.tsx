import { ProjectScrollSlider } from "@/components/project/project-scroll-slider";
import type { SiteMediaAssetMap } from "@/features/site-media/site-media";

type ProjectPageProps = {
  siteMedia: SiteMediaAssetMap;
};

export function ProjectPage({ siteMedia }: ProjectPageProps) {
  return <ProjectScrollSlider siteMedia={siteMedia} />;
}
