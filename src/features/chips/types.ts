export type SiteChipType = "editorial" | "promocional" | "temporal";

export type SiteChip = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  type: SiteChipType;
  itemIds: string[];
  startsAt: string | null;
  endsAt: string | null;
  weekdays: number[];
  startTime: string | null;
  endTime: string | null;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
};

export const siteChipTypes: SiteChipType[] = [
  "editorial",
  "promocional",
  "temporal",
];

export const weekdayOptions = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miercoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sabado" },
  { value: 7, label: "Domingo" },
];
