export type ExploreRouteStatus = "draft" | "published";

export type ExploreSponsor = {
  id: string;
  name: string;
  logoUrl: string | null;
  shortMessage: string | null;
  linkUrl: string | null;
};

export type PublicExplorePoint = {
  id: string;
  slug: string;
  publicToken: string;
  position: number;
  title: string;
  introduction: string;
  story: string;
  transcript: string;
  audioUrl: string;
  audioDurationSeconds: number;
  imageUrl: string;
  imageAlt: string;
  artisticMapUrl: string;
  latitude: number;
  longitude: number;
  credits: string | null;
  place: {
    id: string;
    name: string;
    category: string;
  };
};

export type PublicExploreExperience = {
  route: {
    id: string;
    slug: string;
    name: string;
    description: string;
    coverImageUrl: string;
    availableLanguages: string[];
    credits: string | null;
    cityName: string;
  };
  point: PublicExplorePoint;
  nextPoint: Pick<
    PublicExplorePoint,
    "id" | "slug" | "publicToken" | "position" | "title" | "latitude" | "longitude"
  > | null;
  totalPoints: number;
  sponsor: ExploreSponsor | null;
};
