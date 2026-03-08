import { SiteShell } from "@/components/layout/site-shell";
import { OrderTicketScreen } from "@/features/orders/components/order-ticket-screen";

type OrderSuccessPageProps = {
  params: {
    orderId: string;
  };
};

export default function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  return (
    <SiteShell>
      <OrderTicketScreen orderId={params.orderId} />
    </SiteShell>
  );
}
