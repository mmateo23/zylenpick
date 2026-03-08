export type FeedItem = {
  id: string;
  menuItemId: string;
  venueId: string;
  title: string;
  description: string;
  venueName: string;
  venueDistance: string;
  estimatedTimeLabel: string;
  priceLabel: string;
  categoryLabel: string;
  mediaType: "image" | "video";
  mediaUrl: string;
  mediaAlt: string;
  posterUrl?: string;
  likesCount: number;
  isFavorite: boolean;
  isFollowingVenue: boolean;
};
