import Link from "next/link";
import { ExternalLink, Eye } from "lucide-react";

type AdminPreviewLinkProps = {
  href: string;
  description: string;
  label?: string;
};

export function AdminPreviewLink({
  href,
  description,
  label = "Ver en la web",
}: AdminPreviewLinkProps) {
  return (
    <aside className="mt-6 flex flex-col gap-4 rounded-[1.1rem] border border-[#741314]/14 bg-[#741314]/[0.045] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#741314] text-[#FFF7E8]">
          <Eye aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#741314]">
            Vista pública
          </p>
          <p className="mt-1 text-sm leading-6 text-[#381932]/70">{description}</p>
        </div>
      </div>

      <Link
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[#741314]/20 bg-[#FFF7E8] px-4 py-2.5 text-sm font-bold text-[#741314] transition hover:border-[#741314]/35 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2"
      >
        {label}
        <ExternalLink aria-hidden="true" className="h-4 w-4" />
      </Link>
    </aside>
  );
}
