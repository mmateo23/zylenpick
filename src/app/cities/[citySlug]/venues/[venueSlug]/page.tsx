import { redirect } from "next/navigation";

type VenueRedirectPageProps = {
  params: {
    citySlug: string;
    venueSlug: string;
  };
};

export default function VenueRedirectPage({ params }: VenueRedirectPageProps) {
  redirect(`/zonas/${params.citySlug}/venues/${params.venueSlug}`);
}
