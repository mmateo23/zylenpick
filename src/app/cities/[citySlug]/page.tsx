import { redirect } from "next/navigation";

type CityRedirectPageProps = {
  params: {
    citySlug: string;
  };
};

export default function CityRedirectPage({ params }: CityRedirectPageProps) {
  redirect(`/zonas/${params.citySlug}`);
}
