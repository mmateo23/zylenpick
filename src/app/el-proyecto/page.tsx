import type { Metadata } from "next";

import { SiteShell } from "@/components/layout/site-shell";
import { ProjectPage } from "@/components/project/project-page";
import { getBaseMetadata, getSiteUrl } from "@/lib/seo";

export const metadata: Metadata = getBaseMetadata({
  title: "Qué es Pickyalo: descubre lo bueno de aquí",
  description:
    "Pickyalo es una guía local cuidada para descubrir comercios, lugares y planes cerca de ti, sin rankings, reseñas ni ruido.",
  path: "/el-proyecto",
});

export default function ProjectRoutePage() {
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
          "Pickyalo es una guía local cuidada para descubrir comercios, lugares y planes cerca de ti.",
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
      <ProjectPage />
    </SiteShell>
  );
}
