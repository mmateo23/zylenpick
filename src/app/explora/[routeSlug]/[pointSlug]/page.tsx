import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ExplorePointExperience } from "@/components/explore/explore-point-experience";
import { getPublicExploreExperience } from "@/features/explore/services/explore-service";

type Props = {
  params: { routeSlug: string; pointSlug: string };
  searchParams: { unlock?: string };
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const experience = searchParams.unlock
    ? await getPublicExploreExperience(params.routeSlug, params.pointSlug, searchParams.unlock)
    : null;
  return {
    title: experience ? `${experience.point.title} · ${experience.route.name}` : "Pickyalo Explora",
    description: experience?.point.introduction ?? "Experiencia cultural de Pickyalo Explora.",
    robots: { index: false, follow: false },
  };
}

export default async function ExplorePointPage({ params, searchParams }: Props) {
  const experience = searchParams.unlock
    ? await getPublicExploreExperience(params.routeSlug, params.pointSlug, searchParams.unlock)
    : null;
  if (!experience) notFound();
  return <ExplorePointExperience experience={experience} />;
}
