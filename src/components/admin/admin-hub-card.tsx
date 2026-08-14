import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

type AdminHubCardProps = {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  eyebrow?: string;
};

export function AdminHubCard({
  href,
  icon: Icon,
  title,
  description,
  eyebrow,
}: AdminHubCardProps) {
  return (
    <Link
      href={href}
      className="group flex min-h-44 flex-col rounded-[1.2rem] border border-[#741314]/12 bg-[#FFF7E8] p-5 shadow-[0_14px_40px_rgba(116,19,20,0.05)] transition hover:-translate-y-0.5 hover:border-[#741314]/24 hover:shadow-[0_18px_44px_rgba(116,19,20,0.09)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2 motion-reduce:transform-none"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-[0.8rem] bg-[#741314]/[0.07] text-[#741314]">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <ArrowRight
          aria-hidden="true"
          className="h-4 w-4 text-[#741314]/35 transition group-hover:translate-x-0.5 group-hover:text-[#741314] motion-reduce:transform-none"
        />
      </div>
      <div className="mt-auto pt-6">
        {eyebrow ? (
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#741314]/45">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-lg font-semibold text-[#24110E]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[#24110E]/55">
          {description}
        </p>
      </div>
    </Link>
  );
}
