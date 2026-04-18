import type { Metadata } from "next";
import { PrintableOrderTicket } from "@/features/orders/components/printable-order-ticket";
import { getNoIndexMetadata } from "@/lib/seo";

type PrintableTicketPageProps = {
  params: {
    orderId: string;
  };
};

export const metadata: Metadata = getNoIndexMetadata({
  title: "Ticket de pedido",
  description: "Vista privada e imprimible del ticket del pedido.",
});

export default function PrintableTicketPage({
  params,
}: PrintableTicketPageProps) {
  return <PrintableOrderTicket orderId={params.orderId} />;
}
