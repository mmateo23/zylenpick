import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { OrderTicketScreen } from "@/features/orders/components/order-ticket-screen";
import { getNoIndexMetadata } from "@/lib/seo";

type OrderSuccessPageProps = {
  params: {
    orderId: string;
  };
};

export const metadata: Metadata = getNoIndexMetadata({
  title: "Pedido confirmado",
  description: "Pantalla privada de confirmación del pedido.",
});

export default function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  return (
    <SiteShell>
      <OrderTicketScreen orderId={params.orderId} />
    </SiteShell>
  );
}
