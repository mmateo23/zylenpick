import { ProjectScrollSlider } from "@/components/project/project-scroll-slider";

type ProjectPageProps = {
  siteMedia?: unknown;
};

export function ProjectPage(props: ProjectPageProps = {}) {
  void props;

  return <ProjectScrollSlider />;
}
