import {
  getPricePresentation,
  type PriceDisplayInput,
} from "@/features/pricing/price-display";

type ProductPriceBadgeProps = PriceDisplayInput & {
  compact?: boolean;
  className?: string;
};

const modeClassNames = {
  fixed: "border-[#741314]/20 bg-[#FFF7E8] text-[#381932]",
  from: "border-[#C26157]/35 bg-[#FFE9EC] text-[#741314]",
  variable:
    "border-dashed border-[#741314]/38 bg-[#FFF7E8] text-[#741314]",
  hidden:
    "border-dashed border-[#381932]/24 bg-[#FFF7E8]/92 text-[#381932]/78",
} as const;

export function ProductPriceBadge({
  compact = false,
  className,
  ...price
}: ProductPriceBadgeProps) {
  const presentation = getPricePresentation(price);

  return (
    <span
      data-price-mode={presentation.mode}
      className={[
        "inline-flex max-w-full items-center rounded-full border px-3 py-1.5 text-[11px] font-bold shadow-[0_6px_18px_rgba(56,25,50,0.10)]",
        modeClassNames[presentation.mode],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {compact ? presentation.compactLabel : presentation.label}
    </span>
  );
}

