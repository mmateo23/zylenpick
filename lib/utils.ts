import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: Array<string | boolean | null | undefined>) {
  return twMerge(clsx(inputs));
}
