import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import { buildSearchListBreadcrumbs } from "./buildPropertySearchListPageMeta";

type PropertySearchListBreadcrumbsProps = {
  criteria: PropertySearchCriteria;
};

export function PropertySearchListBreadcrumbs({ criteria }: PropertySearchListBreadcrumbsProps) {
  const breadcrumbs = buildSearchListBreadcrumbs(criteria);

  return (
    <nav aria-label="Breadcrumb" className="pb-2 pt-1">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-600 sm:text-sm">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className="inline-flex min-w-0 items-center gap-1">
              {index > 0 ? (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
              ) : null}
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="truncate font-medium text-slate-500 hover:text-sky-700 hover:underline"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="truncate font-medium text-slate-500">{crumb.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
