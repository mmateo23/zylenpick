"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { getOrderById } from "@/features/orders/services/order-storage";
import { formatPrice } from "@/lib/utils/currency";

type PrintableOrderTicketProps = {
  orderId: string;
};

function formatPickupTime(dateValue: string) {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateValue));
}

function formatOrderDate(dateValue: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateValue));
}

export function PrintableOrderTicket({
  orderId,
}: PrintableOrderTicketProps) {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState(() => getOrderById(orderId));

  useEffect(() => {
    const nextOrder = getOrderById(orderId);
    setOrder(nextOrder);

    if (nextOrder && searchParams.get("print") === "1") {
      const timeoutId = window.setTimeout(() => {
        window.print();
      }, 250);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }
  }, [orderId, searchParams]);

  if (!order) {
    return (
      <main className="min-h-screen bg-white px-6 py-10 text-black">
        <section className="mx-auto max-w-xl border border-dashed border-black/30 p-8">
          <h1 className="text-2xl font-semibold">Ticket no disponible</h1>
          <p className="mt-4 text-sm leading-6">
            Este pedido no está disponible en este navegador.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-black print:px-0 print:py-0">
      <section className="mx-auto max-w-xl border border-black/12 bg-white p-8 shadow-sm print:max-w-none print:border-0 print:p-8 print:shadow-none">
        <header className="border-b border-dashed border-black/20 pb-6">
          <p className="text-xs uppercase tracking-[0.24em] text-black/60">
            Ticket de pedido
          </p>
          <h1 className="mt-3 text-3xl font-semibold">{order.venue.name}</h1>
          <p className="mt-2 text-sm text-black/70">Pedido {order.id}</p>
        </header>

        <div className="mt-6 space-y-3 text-sm leading-6">
          <p>
            <strong>Fecha:</strong> {formatOrderDate(order.createdAt)}
          </p>
          <p>
            <strong>Hora estimada de recogida:</strong>{" "}
            {formatPickupTime(order.pickupAt)}
          </p>
          <p>
            <strong>Dirección del local:</strong>{" "}
            {order.venue.address ?? "Dirección pendiente"}
          </p>
        </div>

        <div className="mt-8 border-t border-dashed border-black/20 pt-6">
          <p className="text-xs uppercase tracking-[0.2em] text-black/60">
            Productos
          </p>
          <div className="mt-4 space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-black/70">
                    {item.quantity} x {formatPrice(item.priceAmount, item.currency)}
                  </p>
                </div>
                <p className="font-semibold">
                  {formatPrice(item.priceAmount * item.quantity, item.currency)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-dashed border-black/20 pt-6">
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.totalAmount, order.currency)}</span>
          </div>
        </div>

        <div className="mt-8 flex gap-3 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex rounded-full border border-black/10 bg-black px-5 py-3 text-sm font-semibold text-white"
          >
            Imprimir o guardar PDF
          </button>
        </div>
      </section>
    </main>
  );
}
