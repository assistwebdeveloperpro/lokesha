import { IndianRupee } from "lucide-react";
import type { PublicSearchListing } from "@/components/landing/property-search/property-list/publicSearchListing.types";
import PropertyListPrice from "@/components/user/dashboard/manage-properties/PropertyListPrice";
import { propertyDetailsHeroPriceLabel } from "./propertyDetailsPriceLabel";

type PropertyDetailsHeroPriceSectionProps = {
  listing: PublicSearchListing;
};

export function PropertyDetailsHeroPriceSection({ listing }: PropertyDetailsHeroPriceSectionProps) {
  const priceLabel = propertyDetailsHeroPriceLabel(listing);

  return (
    <div className="flex gap-3 rounded-xl border border-slate-200/90 bg-white px-4 py-3.5 shadow-sm shadow-slate-900/5 sm:gap-4 sm:px-5 sm:py-4">
      <span
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm shadow-sky-600/25 sm:h-11 sm:w-11"
        aria-hidden
      >
        <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.25} />
      </span>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 sm:text-sm">{priceLabel}</p>
        <PropertyListPrice item={listing} tone="hero" />
      </div>
    </div>
  );
}
