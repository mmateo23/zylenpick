"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ClockIcon } from "@/components/icons/clock-icon";
import { getActiveOrder } from "@/features/orders/services/order-storage";

export function ActiveOrderEntry() {
  const router = useRouter();
  const [hasCheckedActiveOrder, setHasCheckedActiveOrder] = useState(false);

  useEffect(() => {
    const activeOrder = getActiveOrder();

    if (activeOrder) {
      router.replace(`/checkout/success/${activeOrder.id}`);
      return;
    }

    setHasCheckedActiveOrder(true);
  }, [router]);

  if (!hasCheckedActiveOrder) {
    return (
      <section className="rounded-[2rem] border border-border-subtle bg-surface p-8 text-text-primary shadow-[var(--shadow-soft)]">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-text-muted">
          Pedidos
        </p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
          Buscando tu pedido activo
        </h1>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-border-subtle bg-surface p-8 text-text-primary shadow-[var(--shadow-soft)] sm:p-10">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/35 bg-accent-soft text-accent-strong">
        <ClockIcon size={20} />
      </div>
      <p className="mt-6 text-sm font-medium uppercase tracking-[0.22em] text-accent-strong">
        Pedidos
      </p>
      <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-[0.98] tracking-[-0.04em] sm:text-5xl">
        Ahora mismo no tienes ningún pedido activo.
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
        Cuando confirmes un pedido para recoger, podrás volver aquí para ver el
        estado, la hora de recogida y cómo llegar al local.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/platos"
          className="inline-flex items-center justify-center rounded-full bg-cta px-5 py-3 text-sm font-semibold text-cta-text shadow-[0_18px_40px_rgba(36,199,136,0.22)] transition hover:bg-cta-hover"
        >
          Ver platos
        </Link>
        <Link
          href="/zonas"
          className="inline-flex items-center justify-center rounded-full border border-border-subtle bg-surface-strong px-5 py-3 text-sm font-semibold text-text-primary transition hover:border-border-strong"
        >
          Elegir zona
        </Link>
      </div>
    </section>
  );
}
