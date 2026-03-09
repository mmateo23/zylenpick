"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { ClockIcon } from "@/components/icons/clock-icon";
import { LocationPinIcon } from "@/components/icons/location-pin-icon";
import {
  ORDER_UPDATED_EVENT,
  getLatestOrder,
} from "@/features/orders/services/order-storage";

function getMinutesRemaining(pickupAt: string) {
  const differenceMs = new Date(pickupAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(differenceMs / 60000));
}

export function ActiveOrderWidget() {
  const pathname = usePathname();
  const [order, setOrder] = useState(() => getLatestOrder());
  const [minutesRemaining, setMinutesRemaining] = useState(() =>
    order ? getMinutesRemaining(order.pickupAt) : 0,
  );

  useEffect(() => {
    const syncOrder = () => {
      const nextOrder = getLatestOrder();
      setOrder(nextOrder);
      setMinutesRemaining(nextOrder ? getMinutesRemaining(nextOrder.pickupAt) : 0);
    };

    syncOrder();
    const intervalId = window.setInterval(syncOrder, 1000);
    window.addEventListener("storage", syncOrder);
    window.addEventListener(ORDER_UPDATED_EVENT, syncOrder);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("storage", syncOrder);
      window.removeEventListener(ORDER_UPDATED_EVENT, syncOrder);
    };
  }, []);

  const isReady = minutesRemaining <= 0;

  const label = useMemo(() => {
    if (!order) {
      return null;
    }

    if (isReady) {
      return "Pedido listo para recoger";
    }

    return `Pedido activo · listo en ${minutesRemaining} min`;
  }, [isReady, minutesRemaining, order]);

  if (!order || pathname === `/checkout/success/${order.id}`) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-24 z-40 px-4 md:inset-x-auto md:bottom-5 md:right-5 md:w-[22rem]">
      <Link
        href={`/checkout/success/${order.id}`}
        className={`magnetic-button flex w-full items-center gap-3 rounded-[1.6rem] border px-4 py-3.5 text-white shadow-[var(--shadow)] backdrop-blur ${
          isReady
            ? "border-[color:var(--accent)]/30 bg-[rgba(14,34,28,0.94)]"
            : "border-white/10 bg-[color:var(--surface-dark)]/96"
        }`}
      >
        <span
          className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            isReady
              ? "bg-[color:var(--accent)]/18 text-[color:var(--accent)]"
              : "bg-[color:var(--brand)] text-white"
          }`}
        >
          {isReady ? <LocationPinIcon size={20} /> : <ClockIcon size={20} />}
        </span>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{label}</p>
          <p className="truncate text-sm text-white/70">{order.venue.name}</p>
        </div>
      </Link>
    </div>
  );
}
