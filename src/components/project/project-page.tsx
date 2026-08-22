import Image from "next/image";
import Link from "next/link";

import type { SiteMediaAssetMap } from "@/features/site-media/site-media";

import styles from "./project-editorial.module.css";

type ProjectPageProps = {
  siteMedia: SiteMediaAssetMap;
};

const problemPoints = [
  "Muchos productos buenos dependen de que alguien pase justo por delante.",
  "Cuando falta una referencia clara, terminamos eligiendo siempre lo mismo.",
  "Un comercio pequeño no siempre tiene tiempo para competir por atención.",
  "Más opciones no siempre ayudan. A veces solo hacen más difícil decidir.",
];

const workingMethod = [
  "Visitamos",
  "Fotografiamos",
  "Comprobamos",
  "Contrastamos fuentes",
  "Publicamos una selección",
  "Actualizamos cuando cambia",
];

export function ProjectPage({ siteMedia }: ProjectPageProps) {
  return (
    <article className={styles.page}>
      <section className={styles.hero} aria-labelledby="project-title">
        <Image
          src={siteMedia.project_hero.imageUrl}
          alt="Producto local fotografiado de cerca"
          fill
          priority
          sizes="(max-width: 1536px) 100vw, 1480px"
          className={styles.heroImage}
        />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroContent}>
          <p className={styles.kicker}>El proyecto Pickyalo</p>
          <h1 id="project-title" className={styles.heroTitle}>
            Lo bueno de cerca no debería pasar desapercibido.
          </h1>
          <p className={styles.heroLead}>
            Pickyalo convierte platos, productos y lugares reales en un
            escaparate claro para descubrir, elegir y volver a lo local.
          </p>
          <div className={styles.heroActions}>
            <Link href="/platos" className={styles.primaryAction}>
              Explorar Pickyalo
            </Link>
            <Link href="/unete" className={styles.lightAction}>
              Quiero sumar mi local
            </Link>
          </div>
          <p className={styles.editorialStamp}>
            Hecho cerca. Descubierto por más gente.
          </p>
        </div>
      </section>

      <section className={styles.origin} aria-labelledby="origin-title">
        <div className={styles.sectionNumber} aria-hidden="true">01</div>
        <div className={styles.originCopy}>
          <p className={styles.kickerDark}>El origen</p>
          <h2 id="origin-title" className={styles.sectionTitle}>
            Pickyalo nace aquí.
          </h2>
          <p className={styles.leadCopy}>
            No nace desde una lista automática. Nace entre cocinas, barras,
            comercios familiares, calles y lugares que conocemos y comprobamos.
          </p>
          <p className={styles.bodyCopy}>
            Miramos lo que ya existe, lo presentamos mejor y lo acercamos a
            personas que quieren descubrir algo bueno sin perderse entre ruido.
          </p>
        </div>
        <figure className={styles.originFigure}>
          <Image
            src={siteMedia.project_step_discover.imageUrl}
            alt="Profesional de un comercio local trabajando en su cocina"
            fill
            sizes="(max-width: 767px) 100vw, 50vw"
            className={styles.coverImage}
          />
          <figcaption>Detrás de cada producto hay un oficio y un lugar.</figcaption>
        </figure>
      </section>

      <section className={styles.problem} aria-labelledby="problem-title">
        <div className={styles.problemIntro}>
          <p className={styles.kickerLight}>Lo que vimos</p>
          <h2 id="problem-title" className={styles.problemTitle}>
            Hay gente buscando. Hay negocios que merecen encontrarse.
          </h2>
        </div>
        <div className={styles.problemGrid}>
          {problemPoints.map((point, index) => (
            <p key={point}>
              <span aria-hidden="true">0{index + 1}</span>
              {point}
            </p>
          ))}
        </div>
      </section>

      <section className={styles.proposal} aria-labelledby="proposal-title">
        <div className={styles.sectionNumber} aria-hidden="true">02</div>
        <div className={styles.proposalHeading}>
          <p className={styles.kickerDark}>La propuesta</p>
          <h2 id="proposal-title" className={styles.statement}>
            No movemos tu negocio. Movemos su escaparate.
          </h2>
        </div>
        <div className={styles.flow} aria-label="Del comercio a la persona y de vuelta al comercio">
          {["Local", "Producto", "Pickyalo", "Persona", "Local"].map((item, index) => (
            <div key={`${item}-${index}`} className={styles.flowItem}>
              <span>{item}</span>
              {index < 4 ? <b aria-hidden="true">→</b> : null}
            </div>
          ))}
        </div>
        <div className={styles.proposalBody}>
          <p className={styles.leadCopy}>
            Seleccionamos lo importante, lo fotografiamos y lo presentamos de
            forma clara para convertir una mirada en una visita o una recogida.
          </p>
          <figure className={styles.productFigure}>
            <Image
              src={siteMedia.project_step_order.imageUrl}
              alt="Plato real presentado con claridad para ayudar a elegir"
              fill
              sizes="(max-width: 767px) 100vw, 56vw"
              className={styles.coverImage}
            />
          </figure>
        </div>
      </section>

      <section className={styles.how} aria-labelledby="how-title">
        <header className={styles.howHeader}>
          <p className={styles.kickerDark}>Cómo funciona</p>
          <h2 id="how-title" className={styles.sectionTitle}>
            Tres gestos. Nada más.
          </h2>
        </header>
        <ol className={styles.steps}>
          <li>
            <span>01</span>
            <h3>Mira</h3>
            <p>Producto real y una selección cuidada que entra por los ojos.</p>
          </li>
          <li>
            <span>02</span>
            <h3>Elige</h3>
            <p>Información clara para decidir sin menús interminables.</p>
          </li>
          <li>
            <span>03</span>
            <h3>Recoge</h3>
            <p>Un comercio cercano prepara tu selección para cuando llegues.</p>
          </li>
        </ol>
        <div className={styles.difference} aria-label="Qué diferencia a Pickyalo">
          <span>Producto real</span>
          <span>Selección cuidada</span>
          <span>Información clara</span>
          <span>Comercio cercano</span>
          <span>Sin menús interminables</span>
          <span>Sin reseñas públicas que generen ruido</span>
        </div>
      </section>

      <section className={styles.city} aria-labelledby="city-title">
        <figure className={styles.cityFigure}>
          <Image
            src={siteMedia.project_step_pickup.imageUrl}
            alt="Talavera de la Reina, ciudad de origen de Pickyalo"
            fill
            sizes="(max-width: 767px) 100vw, 58vw"
            className={styles.coverImage}
          />
        </figure>
        <div className={styles.cityCopy}>
          <p className={styles.kickerLight}>La ciudad</p>
          <h2 id="city-title" className={styles.cityTitle}>
            Una ciudad también se descubre por lo que cocina y cuenta.
          </h2>
          <p>
            La comida es el centro. A su alrededor aparecen calles, murales,
            parques, patrimonio y comercios que ayudan a entender mejor cada zona.
          </p>
          <p>
            El mapa amplía el descubrimiento con rutas, planes y colaboraciones
            locales sin convertir Pickyalo en otra lista genérica de lugares.
          </p>
          <Link href="/mapa" className={styles.creamAction}>
            Explorar el mapa
          </Link>
        </div>
      </section>

      <section className={styles.method} aria-labelledby="method-title">
        <div className={styles.methodHeading}>
          <p className={styles.kickerDark}>Cómo trabajamos</p>
          <h2 id="method-title" className={styles.sectionTitle}>
            Menos automatismo. Más criterio local.
          </h2>
          <p className={styles.bodyCopy}>
            Publicamos solo lo que podemos explicar con claridad y revisamos el
            contenido cuando la realidad del lugar cambia.
          </p>
        </div>
        <ol className={styles.methodList}>
          {workingMethod.map((item, index) => (
            <li key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item}</strong>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.business} aria-labelledby="business-title">
        <figure className={styles.businessFigure}>
          <Image
            src={siteMedia.project_idea.imageUrl}
            alt="Persona responsable de un local preparando su propuesta"
            fill
            sizes="(max-width: 767px) 100vw, 48vw"
            className={styles.coverImage}
          />
        </figure>
        <div className={styles.businessCopy}>
          <p className={styles.kickerDark}>Para los comercios</p>
          <h2 id="business-title" className={styles.sectionTitle}>
            Tú cuidas tu negocio. Nosotros hacemos que más gente lo descubra.
          </h2>
          <p className={styles.leadCopy}>
            Pickyalo no cambia tu forma de trabajar. Mejora cómo se presenta lo
            que haces y cómo lo encuentra la gente de tu zona.
          </p>
          <Link href="/unete" className={styles.primaryAction}>
            Quiero que mi local esté aquí
          </Link>
        </div>
      </section>

      <section className={styles.closing} aria-labelledby="closing-title">
        <p className={styles.kickerLight}>Pickyalo</p>
        <h2 id="closing-title">
          Menos vueltas. Más producto local. Más ciudad.
        </h2>
        <div className={styles.closingActions}>
          <Link href="/mapa?localizar=1" className={styles.creamAction}>
            Descubrir cerca
          </Link>
          <Link href="/unete" className={styles.outlineAction}>
            Sumar mi local
          </Link>
        </div>
      </section>
    </article>
  );
}
