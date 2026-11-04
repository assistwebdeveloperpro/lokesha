import { SearchX } from "lucide-react";
import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import { PropertySearchListingCard } from "./PropertySearchListingCard";
import type { PublicSearchListing } from "./publicSearchListing.types";
import { resolveSearchEmptyState } from "./searchEmptyState";

type PropertySearchEmptyStateProps = {
  criteria: PropertySearchCriteria;
  otherLocalities: PublicSearchListing[];
};

export function PropertySearchEmptyState({
  criteria,
  otherLocalities,
}: PropertySearchEmptyStateProps) {
  const { message, suggestionsTitle } = resolveSearchEmptyState(criteria, otherLocalities);

  return (
    <div className="space-y-6">
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center gap-3 rounded-2xl border border-sky-200/70 bg-linear-to-b from-sky-50/80 to-white px-5 py-6 text-center shadow-sm sm:px-6 sm:py-7"
      >
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-white ring-1 ring-sky-100"
          aria-hidden
        >
          <SearchX className="h-5 w-5 text-sky-600" />
        </div>
        <p className="max-w-md text-sm font-medium leading-snug text-slate-700 sm:text-base">{message}</p>
      </div>

      {suggestionsTitle ? (
        <section aria-label={suggestionsTitle}>
          <h2 className="mb-3 font-display text-lg font-bold tracking-tight text-slate-900">
            {suggestionsTitle}
          </h2>
          <ul className="space-y-4 sm:space-y-5">
            {otherLocalities.map((listing) => (
              <li key={listing.id}>
                <PropertySearchListingCard listing={listing} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
