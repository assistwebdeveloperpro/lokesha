import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import { buildSearchListSeoDescription } from "./buildPropertySearchListPageMeta";
import { PropertySearchListSeoBlurb } from "./PropertySearchListSeoBlurb";
import type { PublicSearchListing } from "./publicSearchListing.types";

type PropertySearchListSeoSectionProps = {
  criteria: PropertySearchCriteria;
  total: number;
  listings: PublicSearchListing[];
};

export function PropertySearchListSeoSection({
  criteria,
  total,
  listings,
}: PropertySearchListSeoSectionProps) {
  const seoDescription = buildSearchListSeoDescription(criteria, total, listings);

  return (
    <div className="mb-4 pb-1">
      <PropertySearchListSeoBlurb text={seoDescription} />
    </div>
  );
}
