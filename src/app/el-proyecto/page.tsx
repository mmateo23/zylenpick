import type { Metadata } from "next";

import { SiteShell } from "@/components/layout/site-shell";
import { ProjectPage } from "@/components/project/project-page";
import { getSiteMediaAssetMap } from "@/features/site-media/services/site-media-service";
import { getBaseMetadata, getSiteUrl } from "@/lib/seo";

export const metadata: Metadata = getBaseMetadata({
  title: "Qué es Pickyalo: gastronomía y descubrimiento local",
  description:
    "Pickyalo descubre y presenta platos, productos, comercios y lugares reales para que sea más fácil encontrar, elegir y volver a lo local.",
  path: "/el-proyecto",
});

export default async function ProjectRoutePage() {
  const siteMedia = await getSiteMediaAssetMap();
  const siteUrl = getSiteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${siteUrl}/el-proyecto#about`,
        url: `${siteUrl}/el-proyecto`,
        name: "El proyecto Pickyalo",
        description:
          "Pickyalo descubre y presenta platos, productos, comercios y lugares reales para hacer más fácil volver a lo local.",
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#organization` },
        inLanguage: "es-ES",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteUrl}/el-proyecto#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Inicio",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "El proyecto",
            item: `${siteUrl}/el-proyecto`,
          },
        ],
      },
    ],
  };

  return (
    <SiteShell wideContent>
      <script
        id="project-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <ProjectPage siteMedia={siteMedia} />
    </SiteShell>
  );
}
