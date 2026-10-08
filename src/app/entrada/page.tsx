import type { Metadata } from "next";
import { SecretEntrance } from "./secret-entrance";
import { safeAccessDestination } from "@/lib/site-access";

export const metadata: Metadata = {
  title: "La entrada secreta",
  robots: { index: false, follow: false },
};
export default function EntrancePage({ searchParams }: { searchParams: { next?: string } }) {
  return <SecretEntrance destination={safeAccessDestination(searchParams.next)} />;
}
