"use client";

import { useEffect, useState } from "react";

import { getActiveOrder, ORDER_UPDATED_EVENT } from "@/features/orders/services/order-storage";
import type { OrderRecord } from "@/features/orders/types";

export function useActiveOrder() {
  const [activeOrder, setActiveOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    const syncActiveOrder = () => {
      setActiveOrder(getActiveOrder());
    };

    syncActiveOrder();

    window.addEventListener("storage", syncActiveOrder);
    window.addEventListener(ORDER_UPDATED_EVENT, syncActiveOrder);

    return () => {
      window.removeEventListener("storage", syncActiveOrder);
      window.removeEventListener(ORDER_UPDATED_EVENT, syncActiveOrder);
    };
  }, []);

  return { activeOrder };
}
