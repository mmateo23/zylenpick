import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { SiteMediaAssetMap } from "@/features/site-media/site-media";

import styles from "./project-editorial.module.css";

type ProjectPageProps = { siteMedia?: SiteMediaAssetMap };

const paths = [
  { title: "Comercios", copy: "Lo que hacen bien." },
  { title: "Lugares", copy: "Lo que merece una parada." },
  { title: "Planes", copy: "Lo que está pasando." },
];

export function ProjectPage(props: ProjectPageProps = {}) {
  // Keep the existing caller contract; the editorial layout uses curated assets.
  void props;
  return (
    <article className={styles.page}>
      <section className={styles.hero} aria-labelledby="project-title">
        <div className={styles.copy}>
          <p className={styles.kicker}>Pickyalo · El proyecto</p>
          <h1 id="project-title">
            Lo bueno de aquí,
            <em> más fácil de encontrar.</em>
          </h1>
          <p className={styles.lead}>
            Pickyalo es una guía local cuidada para descubrir comercios,
            lugares y planes cerca de ti.
          </p>
          <p className={styles.promise}>Sin rankings. Sin reseñas. Sin ruido.</p>

          <div className={styles.actions}>
            <Link href="/" className={styles.primaryAction}>
              Empezar a descubrir <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/unete" className={styles.secondaryAction}>
              Sumar mi local
            </Link>
          </div>
        </div>

        <figure className={styles.visual}>
          <span className={styles.visualLabel}>Talavera de la Reina</span>
          <Image
            src="/home/drive/place-02.png"
            alt="Patrimonio de Talavera de la Reina"
            fill
            priority
            sizes="(max-width: 760px) 92vw, 48vw"
            className={styles.placeImage}
          />
          <Image
            src="/home/drive/place-08.png"
            alt=""
            width={300}
            height={430}
            aria-hidden="true"
            className={styles.sticker}
          />
        </figure>
      </section>

      <section className={styles.paths} aria-labelledby="paths-title">
        <header>
          <p className={styles.kicker}>Una sola guía local</p>
          <h2 id="paths-title">Tres formas de aprovechar tu ciudad.</h2>
        </header>
        <div className={styles.pathGrid}>
          {paths.map((path, index) => (
            <div key={path.title} className={styles.path}>
              <span aria-hidden="true">0{index + 1}</span>
              <h3>{path.title}</h3>
              <p>{path.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.manifesto} aria-labelledby="manifesto-title">
        <p className={styles.kickerLight}>Nuestro criterio</p>
        <h2 id="manifesto-title">
          Elegimos poco para que decidir sea <em>fácil.</em>
        </h2>
        <p>
          Miramos cerca, comprobamos la información y presentamos cada lugar
          con claridad. Lo local ya tiene valor; Pickyalo ayuda a verlo.
        </p>
        <Link href="/mapa?localizar=1" className={styles.lightAction}>
          Ver qué tengo cerca <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>
    </article>
  );
}
