import Link from "next/link";
import { Calculator, Plus } from "lucide-react";
import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import { PropertySearchShareRequirementCard } from "./PropertySearchShareRequirementCard";

type PropertySearchResultsSidebarProps = {
  criteria: PropertySearchCriteria;
};

export function PropertySearchResultsSidebar({
  criteria,
}: PropertySearchResultsSidebarProps) {
  return (
    <aside
      aria-label="Promotions and tools"
      className="hidden min-w-0 space-y-4 self-start lg:sticky lg:top-52 lg:block lg:w-72 xl:top-56 xl:w-80"
    >
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex h-28 items-end justify-center bg-linear-to-br from-sky-50 to-slate-100 px-4 pt-4">
          <Plus className="mb-4 h-10 w-10 text-navy-blue" aria-hidden />
        </div>
        <div className="p-4">
          <h3 className="text-base font-bold text-slate-900">Sell/Rent Property</h3>
          <p className="mt-1 text-sm text-slate-600">
            List on Lokesha and reach verified buyers and tenants across your city.
          </p>
          <Link
            href="/post-property"
            className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-lg border-2 border-navy-blue bg-white text-sm font-semibold text-navy-blue transition hover:bg-slate-50"
          >
            + Post Property
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex h-24 items-center justify-center bg-sky-50">
          <Calculator className="h-9 w-9 text-sky-600" aria-hidden />
        </div>
        <div className="p-4">
          <h3 className="text-base font-bold text-slate-900">Get your home loan</h3>
          <p className="mt-1 text-sm text-slate-600">Quick and easy loan assistance from trusted partners.</p>
          <button
            type="button"
            className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-navy-blue text-sm font-semibold text-white transition hover:opacity-90"
          >
            Enquire now
          </button>
        </div>
      </div>

      <PropertySearchShareRequirementCard criteria={criteria} />
    </aside>
  );
}
