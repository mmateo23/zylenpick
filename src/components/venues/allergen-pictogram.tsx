import {
  Bean,
  CircleDot,
  Egg,
  Fish,
  FlaskConical,
  Flower2,
  Leaf,
  Milk,
  Nut,
  Shell,
  Shrimp,
  Sprout,
  Wheat,
  type LucideIcon,
} from "lucide-react";

import type { MenuItemAllergen } from "@/features/venues/types";

export const allergenLabels: Record<MenuItemAllergen, string> = {
  gluten: "Gluten",
  crustaceos: "Crustáceos",
  huevo: "Huevo",
  pescado: "Pescado",
  cacahuetes: "Cacahuetes",
  soja: "Soja",
  leche: "Leche",
  frutos_de_cascara: "Frutos de cáscara",
  apio: "Apio",
  mostaza: "Mostaza",
  sesamo: "Sésamo",
  sulfitos: "Sulfitos",
  altramuces: "Altramuces",
  moluscos: "Moluscos",
};

const allergenIcons: Record<MenuItemAllergen, LucideIcon> = {
  gluten: Wheat,
  crustaceos: Shrimp,
  huevo: Egg,
  pescado: Fish,
  cacahuetes: Nut,
  soja: Bean,
  leche: Milk,
  frutos_de_cascara: Nut,
  apio: Leaf,
  mostaza: Sprout,
  sesamo: CircleDot,
  sulfitos: FlaskConical,
  altramuces: Flower2,
  moluscos: Shell,
};

type AllergenPictogramProps = {
  allergen: MenuItemAllergen;
  compact?: boolean;
};

export function AllergenPictogram({
  allergen,
  compact = false,
}: AllergenPictogramProps) {
  const Icon = allergenIcons[allergen];
  const label = allergenLabels[allergen];

  return (
    <span
      className={`inline-flex items-center border border-[#C26157]/22 bg-white text-[#381932] ${
        compact
          ? "h-8 w-8 justify-center rounded-full"
          : "gap-2 rounded-[0.8rem] px-2.5 py-2 text-xs font-bold"
      }`}
      title={label}
      aria-label={label}
    >
      <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-[#C26157]" strokeWidth={2.2} />
      {compact ? <span className="sr-only">{label}</span> : <span>{label}</span>}
    </span>
  );
}
