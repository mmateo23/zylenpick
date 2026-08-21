import type { MenuItemAllergen } from "@/features/venues/types";

export const menuItemAllergenOptions: {
  value: MenuItemAllergen;
  label: string;
}[] = [
  { value: "gluten", label: "Gluten" },
  { value: "crustaceos", label: "Crustáceos" },
  { value: "huevo", label: "Huevo" },
  { value: "pescado", label: "Pescado" },
  { value: "cacahuetes", label: "Cacahuetes" },
  { value: "soja", label: "Soja" },
  { value: "leche", label: "Leche" },
  { value: "frutos_de_cascara", label: "Frutos de cáscara" },
  { value: "apio", label: "Apio" },
  { value: "mostaza", label: "Mostaza" },
  { value: "sesamo", label: "Sésamo" },
  { value: "sulfitos", label: "Sulfitos" },
  { value: "altramuces", label: "Altramuces" },
  { value: "moluscos", label: "Moluscos" },
];

export const menuItemAllergenValues = new Set<MenuItemAllergen>(
  menuItemAllergenOptions.map((option) => option.value),
);

