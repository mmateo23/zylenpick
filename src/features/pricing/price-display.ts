import { formatPrice } from "@/lib/utils/currency";

export const PRICE_DISPLAY_MODES = [
  "fixed",
  "from",
  "variable",
  "hidden",
] as const;

export type PriceDisplayMode = (typeof PRICE_DISPLAY_MODES)[number];

export type PriceDisplayInput = {
  priceAmount: number;
  currency: string;
  priceDisplayMode?: PriceDisplayMode | null;
  priceDisplayText?: string | null;
  pricesVisible?: boolean;
};

export type PricePresentation = {
  mode: PriceDisplayMode;
  label: string;
  compactLabel: string;
  isDefinitive: boolean;
};

type PriceableItem = PriceDisplayInput & {
  quantity?: number;
};

const DEFAULT_VARIABLE_PRICE_TEXT = "Precio a confirmar";
const HIDDEN_PRICE_TEXT = "Contactar";

export function normalizePriceDisplayMode(
  mode: string | null | undefined,
): PriceDisplayMode {
  return PRICE_DISPLAY_MODES.includes(mode as PriceDisplayMode)
    ? (mode as PriceDisplayMode)
    : "fixed";
}

export function getEffectivePriceDisplayMode({
  priceDisplayMode,
  pricesVisible = true,
}: Pick<PriceDisplayInput, "priceDisplayMode" | "pricesVisible">) {
  if (!pricesVisible) {
    return "hidden";
  }

  return normalizePriceDisplayMode(priceDisplayMode);
}

export function getPricePresentation(
  input: PriceDisplayInput,
  options: { quantity?: number } = {},
): PricePresentation {
  const mode = getEffectivePriceDisplayMode(input);
  const quantity = Math.max(1, options.quantity ?? 1);
  const amountLabel = formatPrice(input.priceAmount * quantity, input.currency);

  if (mode === "from") {
    return {
      mode,
      label: `Desde ${amountLabel}`,
      compactLabel: `Desde ${amountLabel}`,
      isDefinitive: false,
    };
  }

  if (mode === "variable") {
    const configuredLabel = input.priceDisplayText?.trim();
    const label = configuredLabel || DEFAULT_VARIABLE_PRICE_TEXT;

    return {
      mode,
      label,
      compactLabel: label,
      isDefinitive: false,
    };
  }

  if (mode === "hidden") {
    const configuredLabel = input.priceDisplayText?.trim();
    const label = configuredLabel || HIDDEN_PRICE_TEXT;

    return {
      mode,
      label,
      compactLabel: label,
      isDefinitive: false,
    };
  }

  return {
    mode: "fixed",
    label: amountLabel,
    compactLabel: amountLabel,
    isDefinitive: true,
  };
}

export function getPriceSummary(items: PriceableItem[]) {
  const isDefinitive =
    items.length > 0 &&
    items.every(
      (item) =>
        getEffectivePriceDisplayMode(item) === "fixed",
    );

  return {
    isDefinitive,
    totalAmount: items.reduce(
      (total, item) =>
        total + item.priceAmount * Math.max(1, item.quantity ?? 1),
      0,
    ),
    requiresConfirmation: !isDefinitive,
  };
}

export function isDefinitivePrice(input: PriceDisplayInput) {
  return getEffectivePriceDisplayMode(input) === "fixed";
}

