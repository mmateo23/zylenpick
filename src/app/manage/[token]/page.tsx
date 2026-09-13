import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readManagedVenue } from "@/features/manage/service";
import { ManageVenuePanel } from "@/components/manage/manage-venue-panel";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = {
  title: "Tu comercio · Acceso privado",
  description: "El mando de tu comercio en Pickyalo.",
  robots: { index: false, follow: false, noarchive: true, googleBot: { index: false, follow: false } },
  referrer: "no-referrer",
};

export default async function ManagePage({ params }: { params: { token: string } }) {
  const venue = await readManagedVenue(params.token);
  if (!venue) notFound();
  return <ManageVenuePanel initialVenue={venue} token={params.token} />;
}
