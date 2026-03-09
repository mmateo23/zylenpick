import { PrintableOrderTicket } from "@/features/orders/components/printable-order-ticket";

type PrintableTicketPageProps = {
  params: {
    orderId: string;
  };
};

export default function PrintableTicketPage({
  params,
}: PrintableTicketPageProps) {
  return <PrintableOrderTicket orderId={params.orderId} />;
}
