import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

type AdminPaginationProps = {
  page: number;
  total: number;
  pageSize: number;
  searchParams?: Record<string, string | undefined>;
};

function pageHref(
  targetPage: number,
  searchParams: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && key !== "pagina") params.set(key, value);
  });
  if (targetPage > 1) params.set("pagina", String(targetPage));
  const suffix = params.toString();
  return suffix ? `?${suffix}` : "?";
}

export function AdminPagination({
  page,
  total,
  pageSize,
  searchParams = {},
}: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);

  return (
    <nav
      aria-label="Paginación"
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-3"
    >
      <p className="text-sm font-medium text-[#381932]/70">
        {firstItem}–{lastItem} de {total}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={pageHref(page - 1, searchParams)}
            className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-[#741314]/16 bg-white px-3 text-sm font-bold text-[#741314] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314]"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            Anterior
          </Link>
        ) : null}
        <span className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-[#741314] px-3 text-sm font-bold text-[#FFF7E8]">
          {page}/{totalPages}
        </span>
        {page < totalPages ? (
          <Link
            href={pageHref(page + 1, searchParams)}
            className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-[#741314]/16 bg-white px-3 text-sm font-bold text-[#741314] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314]"
          >
            Siguiente
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
