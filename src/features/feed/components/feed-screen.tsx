import { FeedExperience } from "@/features/feed/components/feed-experience";
import type { FeedItem } from "@/features/feed/types";

type FeedScreenProps = {
  items: FeedItem[];
};

export function FeedScreen({ items }: FeedScreenProps) {
  return <FeedExperience items={items} />;
}
