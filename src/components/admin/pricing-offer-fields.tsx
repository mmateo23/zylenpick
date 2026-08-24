"use client";

import { useState } from "react";

import type { SiteFunnelPricingOfferConfig } from "@/features/funnel/site-funnel-settings";

const fieldClassName =
  "mt-2 min-h-11 w-full rounded-[0.9rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3.5 py-2.5 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:var(--brand)]/15";

type PricingOfferFieldsProps = {
  config: SiteFunnelPricingOfferConfig;
  description: string;
  fieldKey: string;
  name: string;
  priceSuffix: string;
};

function formatInputPrice(cents: number) {
  return (cents / 100).toFixed(2);
}

export function PricingOfferFields({
  config,
  description,
  fieldKey,
  name,
  priceSuffix,
}: PricingOfferFieldsProps) {
  const prefix = `pricing.${fieldKey}`;
  const [couponId, setCouponId] = useState(config.stripeCouponId);
  const [enabled, setEnabled] = useState(config.enabled && Boolean(config.stripeCouponId));
  const isLinked = couponId.trim().length > 0;

  const handleCouponChange = (value: string) => {
    setCouponId(value);
    if (!value.trim()) {
      setEnabled(false);
    }
  };

  return (
    <fieldset className="min-w-0 rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
      <legend className="sr-only">{name}</legend>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[color:var(--foreground)]">{name}</h3>
          <p className="mt-1 text-sm leading-6 text-[color:var(--muted-strong)]">
            {description} · {priceSuffix}
          </p>
        </div>
        <span
          className={`inline-flex min-h-7 items-center rounded-full border px-2.5 text-xs font-bold ${
            isLinked
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-amber-300 bg-amber-50 text-amber-900"
          }`}
          aria-live="polite"
        >
          {isLinked ? "Vinculado" : "Sin vincular"}
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Precio original (€)
          </span>
          <input
            name={`${prefix}.originalPrice`}
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            defaultValue={formatInputPrice(config.originalPriceCents)}
            className={fieldClassName}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Precio con descuento (€)
          </span>
          <input
            name={`${prefix}.discountedPrice`}
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            defaultValue={formatInputPrice(config.discountedPriceCents)}
            className={fieldClassName}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Etiqueta pública
          </span>
          <input
            name={`${prefix}.label`}
            defaultValue={config.label}
            placeholder="Precio de lanzamiento — primeros 20 negocios"
            className={fieldClassName}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Caduca el
          </span>
          <input
            name={`${prefix}.expiresAt`}
            type="date"
            defaultValue={config.expiresAt}
            className={fieldClassName}
          />
          <span className="mt-1.5 block text-xs leading-5 text-[color:var(--muted-strong)]">
            Déjalo vacío para mantenerlo hasta desactivarlo.
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Stripe Promotion Code ID
          </span>
          <input
            name={`${prefix}.stripePromotionCodeId`}
            defaultValue={config.stripePromotionCodeId}
            placeholder="promo_... (opcional)"
            autoComplete="off"
            className={fieldClassName}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Stripe Coupon ID
          </span>
          <input
            name={`${prefix}.stripeCouponId`}
            value={couponId}
            onChange={(event) => handleCouponChange(event.target.value)}
            placeholder="coupon_..."
            autoComplete="off"
            className={fieldClassName}
            aria-describedby={`${fieldKey}-stripe-help`}
          />
          <span
            id={`${fieldKey}-stripe-help`}
            className="mt-1.5 block text-xs leading-5 text-[color:var(--muted-strong)]"
          >
            Se comprueba que exista un identificador, no su validez en Stripe.
          </span>
        </label>
      </div>

      <div className="mt-5 border-t border-[color:var(--border)] pt-4">
        <label
          className={`flex min-h-11 items-center gap-3 text-sm font-semibold ${
            isLinked
              ? "cursor-pointer text-[color:var(--foreground)]"
              : "cursor-not-allowed text-[color:var(--muted)]"
          }`}
        >
          <input
            type="checkbox"
            name={`${prefix}.enabled`}
            checked={enabled}
            disabled={!isLinked}
            onChange={(event) => setEnabled(event.target.checked)}
            className="h-5 w-5 shrink-0 accent-[color:var(--brand)]"
          />
          Activar precio de lanzamiento
        </label>
        {!isLinked ? (
          <p className="mt-2 text-xs font-medium leading-5 text-amber-900">
            Crea primero el cupón en Stripe test y pega su ID para poder activar el descuento.
          </p>
        ) : null}
      </div>
    </fieldset>
  );
}
