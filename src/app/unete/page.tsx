import type { Metadata } from "next";
import Image from "next/image";
import { Check } from "lucide-react";

import { JoinForm } from "@/components/join/join-form";
import { SiteShell } from "@/components/layout/site-shell";
import { getSiteMediaAssetMap } from "@/features/site-media/services/site-media-service";
import { getBaseMetadata } from "@/lib/seo";

import styles from "./unete.module.css";

export const metadata: Metadata = getBaseMetadata({
  title: "Únete a Pickyalo",
  description: "Cuéntanos qué negocio local tienes y hablamos contigo para incorporarlo a Pickyalo.",
  path: "/unete",
});

export default async function JoinPage() {
  const siteMedia = await getSiteMediaAssetMap();

  return (
    <SiteShell wideContent className={styles.page}>
      <div className={styles.main}>
        <section className={styles.intro} aria-labelledby="join-title">
          <div className={styles.copy}>
            <p className={styles.eyebrow}>NEGOCIOS CON ALGO PROPIO</p>
            <h1 id="join-title">Lo haces aquí.<br /><em>Queremos conocerlo.</em></h1>
            <p className={styles.lead}>Pickyalo reúne lugares, productos y proyectos locales que merece la pena descubrir. Si tienes uno, cuéntanos lo esencial.</p>
            <ul>
              <li><Check size={17} aria-hidden="true" /> Un formulario breve</li>
              <li><Check size={17} aria-hidden="true" /> Hablamos contigo personalmente</li>
              <li><Check size={17} aria-hidden="true" /> Tú decides qué información publicar</li>
            </ul>
          </div>
          <figure className={styles.image}>
            <Image src={siteMedia.join_hero.imageUrl} alt="Comercio local seleccionado por Pickyalo" fill sizes="(max-width: 799px) 92vw, 46vw" priority />
            <figcaption>Comercio local · Talavera y comarca</figcaption>
          </figure>
        </section>

        <section className={styles.formSection} aria-label="Formulario para unirse a Pickyalo">
          <JoinForm />
          <aside>
            <p className={styles.eyebrow}>QUÉ PASA DESPUÉS</p>
            <h2>Primero hablamos.<br />Luego damos forma a tu ficha.</h2>
            <p>Revisamos tu negocio, acordamos qué mostrar y te pedimos únicamente la información que falte. Sin procesos largos.</p>
          </aside>
        </section>
      </div>
    </SiteShell>
  );
}
