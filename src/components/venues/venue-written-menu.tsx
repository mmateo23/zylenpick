import type { VenueMenuItem } from "@/features/venues/types";
import { getPricePresentation } from "@/features/pricing/price-display";
import styles from "./venue-written-menu.module.css";

export function VenueWrittenMenu({ items, pricesVisible }: { items: VenueMenuItem[]; pricesVisible: boolean }) {
  const categories = Array.from(new Set(items.map(item => item.categoryName?.trim() || "La selección")));
  return <div className={styles.paper}>
    <p className={styles.signature}>La selección de la casa</p>
    {categories.map(category => <section key={category} className={styles.category}>
      <h3>{category}</h3>
      <ul>{items.filter(item => (item.categoryName?.trim() || "La selección") === category).map(item => {
        const price = getPricePresentation({...item,pricesVisible});
        return <li key={item.id} id={`plato-${item.id}`} className={styles.item}>
          <div className={styles.line}><h4>{item.name}</h4>{price.mode !== "hidden" ? <span className={styles.price}>{price.label}</span> : null}</div>
          {item.description ? <p>{item.description}</p> : null}
          {item.allergens.length > 0 ? <details className={styles.allergens}><summary>Consultar alérgenos</summary><p>{item.allergens.map(value => value.replaceAll("_", " ")).join(" · ")}</p></details> : null}
        </li>;
      })}</ul>
    </section>)}
    <p className={styles.footnote}>Para saber más, habla con el local.</p>
  </div>;
}
