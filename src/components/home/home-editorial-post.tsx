import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./pickyalo-home.module.css";

// The original iPost presentation, shared by food, city and event editions.
export function HomeEditorialPost({ title, identity, location, image, logo, eyebrow, detail, price, href, priority = false, contain = false, unoptimized = false }: {
  title: string; identity: string; location: string; image: string; logo?: string | null;
  eyebrow: string; detail: string; price?: string; href?: string; priority?: boolean; contain?: boolean; unoptimized?: boolean;
}) {
  const content = <>
    <span className={styles.postHeader}>
      <span className={styles.venueAvatar}>{logo ? <Image src={logo} alt="" fill sizes="44px" className={styles.venueLogo} /> : <span>{identity.trim().slice(0, 1)}</span>}</span>
      <span className={styles.venueIdentity}><strong>{identity}</strong><small>{location}</small></span>
      <ArrowRight size={20} aria-hidden="true" />
    </span>
    <span className={styles.postMedia}><Image src={image} alt={title} fill priority={priority} unoptimized={unoptimized} sizes="(max-width: 699px) 340px, 390px" className={contain ? styles.monumentImage : styles.postImage} /></span>
    <span className={styles.postBody}>
      <small>{eyebrow}</small>
      <span className={styles.postTitleRow}><strong>{title}</strong>{price ? <span>{price}</span> : null}</span>
      <span className={styles.postPickup}>{detail}</span>
    </span>
  </>;
  return href ? <Link href={href} prefetch={false} className={styles.heroPost} aria-label={`Ver ${title} de ${identity}`}>{content}</Link>
    : <article className={styles.heroPost}>{content}</article>;
}
