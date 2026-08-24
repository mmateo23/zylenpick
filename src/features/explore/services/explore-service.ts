import { cache } from "react";

import type {
  ExploreSponsor,
  PublicExploreExperience,
  PublicExplorePoint,
} from "@/features/explore/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CompletePointRow = Record<string, unknown> & {
  id: string;
  slug: string;
  public_token: string;
  position: number;
  title: string;
  introduction: string;
  story: string;
  transcript: string;
  audio_url: string;
  audio_duration_seconds: number;
  image_url: string;
  image_alt: string;
  artistic_map_url: string;
  latitude: number;
  longitude: number;
  map_place_id: string;
};

function completePoint(point: Record<string, unknown>): point is CompletePointRow {
  return Boolean(
    point.id &&
      point.slug &&
      point.public_token &&
      point.title &&
      point.introduction &&
      point.story &&
      point.transcript &&
      point.audio_url &&
      point.audio_duration_seconds !== null &&
      point.image_url &&
      point.image_alt &&
      point.artistic_map_url &&
      point.latitude !== null &&
      point.longitude !== null &&
      point.map_place_id,
  );
}

function toPublicPoint(
  point: CompletePointRow,
  place: { id: string; name: string | null; category: string | null },
): PublicExplorePoint {
  return {
    id: point.id,
    slug: point.slug,
    publicToken: point.public_token,
    position: point.position,
    title: point.title,
    introduction: point.introduction,
    story: point.story,
    transcript: point.transcript,
    audioUrl: point.audio_url,
    audioDurationSeconds: point.audio_duration_seconds,
    imageUrl: point.image_url,
    imageAlt: point.image_alt,
    artisticMapUrl: point.artistic_map_url,
    latitude: point.latitude,
    longitude: point.longitude,
    credits: typeof point.credits === "string" ? point.credits : null,
    place: {
      id: place.id,
      name: place.name ?? point.title,
      category: place.category ?? "lugar",
    },
  };
}

async function getSponsor(id: string | null): Promise<ExploreSponsor | null> {
  if (!id) return null;
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("explore_sponsors")
    .select("id, name, logo_url, short_message, link_url")
    .eq("id", id)
    .maybeSingle();

  return data
    ? {
        id: data.id,
        name: data.name,
        logoUrl: data.logo_url,
        shortMessage: data.short_message,
        linkUrl: data.link_url,
      }
    : null;
}

export const getPublicExploreExperience = cache(
  async (
    routeSlug: string,
    pointSlug: string,
    publicToken: string,
  ): Promise<PublicExploreExperience | null> => {
    if (!routeSlug || !pointSlug || !publicToken) return null;

    const supabase = createSupabaseServerClient();
    const { data: route, error: routeError } = await supabase
      .from("explore_routes")
      .select(
        "id, slug, name, description, cover_image_url, available_languages, credits, sponsor_id, city_id",
      )
      .eq("slug", routeSlug)
      .eq("status", "published")
      .maybeSingle();

    if (routeError || !route || !route.description || !route.cover_image_url) return null;

    const [{ data: city }, { data: point }, { data: points }] = await Promise.all([
      supabase.from("cities").select("name").eq("id", route.city_id).maybeSingle(),
      supabase
        .from("explore_route_points")
        .select(
          "id, route_id, map_place_id, sponsor_id, slug, position, title, introduction, story, transcript, audio_url, audio_duration_seconds, image_url, image_alt, artistic_map_url, latitude, longitude, credits, public_token",
        )
        .eq("route_id", route.id)
        .eq("slug", pointSlug)
        .eq("public_token", publicToken)
        .eq("is_active", true)
        .eq("is_published", true)
        .maybeSingle(),
      supabase
        .from("explore_route_points")
        .select(
          "id, map_place_id, slug, position, title, latitude, longitude, public_token",
        )
        .eq("route_id", route.id)
        .eq("is_active", true)
        .eq("is_published", true)
        .order("position", { ascending: true }),
    ]);

    if (!point || !completePoint(point) || !points) return null;

    const { data: place } = await supabase
      .from("map_places")
      .select("id, name, category")
      .eq("id", point.map_place_id)
      .eq("status", "published")
      .eq("is_active", true)
      .maybeSingle();

    if (!place) return null;

    const nextRow = points.find((item) => item.position > point.position) ?? null;
    const sponsor = await getSponsor(point.sponsor_id ?? route.sponsor_id);
    const publicPoint = toPublicPoint(point, place);

    return {
      route: {
        id: route.id,
        slug: route.slug,
        name: route.name,
        description: route.description,
        coverImageUrl: route.cover_image_url,
        availableLanguages: route.available_languages,
        credits: route.credits,
        cityName: city?.name ?? "",
      },
      point: publicPoint,
      nextPoint:
        nextRow &&
        nextRow.slug &&
        nextRow.public_token &&
        nextRow.title &&
        nextRow.latitude !== null &&
        nextRow.longitude !== null
          ? {
              id: nextRow.id,
              slug: nextRow.slug,
              publicToken: nextRow.public_token,
              position: nextRow.position,
              title: nextRow.title,
              latitude: nextRow.latitude,
              longitude: nextRow.longitude,
            }
          : null,
      totalPoints: points.length,
      sponsor,
    };
  },
);
