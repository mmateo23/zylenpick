type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--brand)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl font-semibold text-[color:var(--foreground)] sm:text-3xl">
          {title}
        </h2>
      </div>
      <p className="max-w-xl text-sm leading-6 text-[color:var(--muted)]">
        {description}
      </p>
    </div>
  );
}
