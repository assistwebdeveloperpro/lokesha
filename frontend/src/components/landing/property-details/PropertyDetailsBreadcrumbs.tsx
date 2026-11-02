import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { PropertyDetailsBreadcrumb } from "./propertyDetails.types";

type PropertyDetailsBreadcrumbsProps = {
  items: PropertyDetailsBreadcrumb[];
};

export function PropertyDetailsBreadcrumbs({ items }: PropertyDetailsBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="hidden pb-2 pt-1 lg:block">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-600 sm:text-sm">
        {items.map((crumb, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className="inline-flex min-w-0 items-center gap-1">
              {index > 0 ? (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
              ) : null}
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="cursor-pointer truncate font-medium text-slate-500 hover:text-sky-700 hover:underline"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={`truncate font-medium ${isLast ? "text-slate-700" : "text-slate-500"}`}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
