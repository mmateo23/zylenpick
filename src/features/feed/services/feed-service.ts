import { mockFeedItems } from "@/features/feed/data/mock-feed-items";
import type { FeedItem } from "@/features/feed/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PostRecord = {
  id: string;
  title: string;
  caption: string | null;
  media_type: "image" | "video";
  media_url: string;
  poster_url: string | null;
  likes_count: number;
  venues: {
    id: string;
    name: string;
    delivery_time_min: number | null;
    delivery_time_max: number | null;
  } | null;
  menu_items: {
    id: string;
    name: string;
    description: string | null;
    price_amount: number;
    currency: string;
  } | null;
};

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(amount / 100);
}

function formatEstimatedTime(min: number | null, max: number | null) {
  if (!min && !max) {
    return "20-25 min";
  }

  if (min && max) {
    return `${min}-${max} min`;
  }

  return `${min ?? max} min`;
}

function mapPostToFeedItem(post: PostRecord): FeedItem | null {
  if (!post.venues || !post.menu_items) {
    return null;
  }

  return {
    id: post.id,
    menuItemId: post.menu_items.id,
    venueId: post.venues.id,
    title: post.title || post.menu_items.name,
    description:
      post.caption || post.menu_items.description || "Descubre este plato del dia.",
    venueName: post.venues.name,
    venueDistance: "Cerca de ti",
    estimatedTimeLabel: formatEstimatedTime(
      post.venues.delivery_time_min,
      post.venues.delivery_time_max,
    ),
    priceLabel: formatPrice(post.menu_items.price_amount, post.menu_items.currency),
    categoryLabel: "Recomendado",
    mediaType: post.media_type,
    mediaUrl: post.media_url,
    mediaAlt: post.title,
    posterUrl: post.poster_url ?? undefined,
    likesCount: post.likes_count,
    isFavorite: false,
    isFollowingVenue: false,
  };
}

export async function getFeedItems(): Promise<FeedItem[]> {
  if (!isSupabaseConfigured()) {
    return mockFeedItems;
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
          id,
          title,
          caption,
          media_type,
          media_url,
          poster_url,
          likes_count,
          venues:venue_id (
            id,
            name,
            delivery_time_min,
            delivery_time_max
          ),
          menu_items:menu_item_id (
            id,
            name,
            description,
            price_amount,
            currency
          )
        `,
      )
      .eq("status", "published")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data) {
      return mockFeedItems;
    }

    const items = (data as PostRecord[])
      .map((post) => mapPostToFeedItem(post))
      .filter((item): item is FeedItem => Boolean(item));

    return items.length > 0 ? items : mockFeedItems;
  } catch {
    return mockFeedItems;
  }
}
