type VenueCardProps = {
  venueName: string;
  venueDistance: string;
  dishesCount: number;
  isFollowing: boolean;
  onToggleFollow: () => void;
};

export function VenueCard({
  venueName,
  venueDistance,
  dishesCount,
  isFollowing,
  onToggleFollow,
}: VenueCardProps) {
  return (
    <article className="rounded-[1.5rem] border border-[color:var(--border)] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-[color:var(--foreground)]">
            {venueName}
          </p>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            {venueDistance} · {dishesCount} platos visibles
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleFollow}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            isFollowing
              ? "bg-[color:var(--foreground)] text-white"
              : "bg-[color:var(--surface-strong)] text-[color:var(--foreground)]"
          }`}
        >
          {isFollowing ? "Siguiendo" : "Seguir"}
        </button>
      </div>
    </article>
  );
}
