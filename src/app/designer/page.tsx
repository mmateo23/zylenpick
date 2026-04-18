import type { Metadata } from "next";

import { EmailingStudio } from "@/components/emailing/emailing-studio";
import { getBaseMetadata } from "@/lib/seo";

export const metadata: Metadata = getBaseMetadata({
  title: "Designer de emailings",
  description: "Herramienta aislada para crear y enviar emailings tabulares.",
  path: "/designer",
});

export default function DesignerPage() {
  return <EmailingStudio />;
}
