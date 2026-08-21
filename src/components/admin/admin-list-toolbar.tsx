"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type AdminListFilter = {
  label: string;
  param: string;
  value: string;
  options: Array<{ label: string; value: string }>;
};

type AdminListToolbarProps = {
  initialQuery?: string;
  placeholder: string;
  filters?: AdminListFilter[];
};

export function AdminListToolbar({
  initialQuery = "",
  placeholder,
  filters = [],
}: AdminListToolbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const firstRender = useRef(true);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const normalizedQuery = query.trim();
      if (normalizedQuery) params.set("q", normalizedQuery);
      else params.delete("q");
      params.delete("pagina");
      const suffix = params.toString();
      router.replace(suffix ? `${pathname}?${suffix}` : pathname, { scroll: false });
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [pathname, query, router, searchParams]);

  function updateFilter(param: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(param, value);
    else params.delete(param);
    params.delete("pagina");
    const suffix = params.toString();
    router.replace(suffix ? `${pathname}?${suffix}` : pathname, { scroll: false });
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-3 sm:grid-cols-[minmax(15rem,1fr)_auto] sm:items-end">
      <label className="min-w-0">
        <span className="mb-1.5 block text-xs font-bold text-[#381932]">Buscar</span>
        <span className="relative block">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#741314]/55"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            className="min-h-11 w-full rounded-xl border border-[#741314]/16 bg-white py-2 pl-10 pr-11 text-base text-[#381932] outline-none placeholder:text-[#381932]/40 focus:border-[#741314] focus:ring-2 focus:ring-[#741314]/10"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#741314] hover:bg-[#741314]/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314]"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          ) : null}
        </span>
      </label>

      {filters.length ? (
        <div className="grid gap-2 sm:grid-flow-col">
          {filters.map((filter) => (
            <label key={filter.param}>
              <span className="mb-1.5 block text-xs font-bold text-[#381932]">
                {filter.label}
              </span>
              <select
                value={filter.value}
                onChange={(event) => updateFilter(filter.param, event.target.value)}
                className="min-h-11 w-full rounded-xl border border-[#741314]/16 bg-white px-3 text-sm font-semibold text-[#381932] outline-none focus:border-[#741314] focus:ring-2 focus:ring-[#741314]/10 sm:w-auto sm:min-w-40"
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}
