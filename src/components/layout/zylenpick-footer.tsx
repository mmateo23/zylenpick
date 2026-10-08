import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import styles from "./zylenpick-footer.module.css";

type ZylenPickFooterProps = { theme?: "dark" | "light" | "auto" };
const exploreLinks = [
  { label: "Comercios", href: "/platos?modo=locales" },
  { label: "Productos", href: "/platos" },
  { label: "Descubrir", href: "/mapa?explora=1" },
  { label: "Autobuses", href: "/autobuses" },
  { label: "Eventos", href: "/eventos" },
];

export function ZylenPickFooter({ theme = "light" }: ZylenPickFooterProps) {
  return <footer className={`${styles.footer} ${styles[theme]}`}>
    <div className={styles.inner}>
      <div className={styles.brand}>
        <Link href="/" aria-label="Pickyalo · inicio" className={styles.logo}>
          <Image className={styles.logoLight} src="/logo/LogoNuevo.svg" alt="Pickyalo" width={144} height={50} />
          <Image className={styles.logoDark} src="/logo/LogoNuevo_Negativo.svg" alt="Pickyalo" width={144} height={50} />
        </Link>
        <p>Lo bueno de aquí,<br /><em>más cerca de ti.</em></p>
        <Link className={styles.nearby} href="/mapa?localizar=1">Buscar cerca de mí<ArrowUpRight size={17} aria-hidden="true" /></Link>
      </div>
      <nav className={styles.links} aria-label="Explorar Pickyalo">
        {exploreLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}<ArrowUpRight size={16} aria-hidden="true" /></Link>)}
      </nav>
      <div className={styles.bottom}>
        <span>Hecho para descubrir lo local.</span>
        <nav aria-label="Sobre Pickyalo">
          <Link href="/el-proyecto">El proyecto</Link>
          <Link href="/unete">Únete</Link>
          <a href="https://www.instagram.com/pickyalo/" target="_blank" rel="noreferrer">Instagram<ArrowUpRight size={12} aria-hidden="true" /></a>
          <Link href="/privacidad">Privacidad</Link>
          <Link href="/cookies">Cookies</Link>
        </nav>
      </div>
    </div>
  </footer>;
}
