import Link from "next/link";
import PropertyListPrice from "@/components/user/dashboard/manage-properties/PropertyListPrice";
import { buildPropertyDetailsUrl } from "@/lib/property-search-url/propertyDetailsUrl";
import type { PublicSearchListing } from "@/components/landing/property-search/property-list/publicSearchListing.types";
import { propertyDetailsContactLabel } from "./propertyDetailsContactLabel";
import { PropertyDetailsSection } from "./PropertyDetailsSection";

type PropertyDetailsSimilarListingsProps = {
  title: string;
  listings: PublicSearchListing[];
};

export function PropertyDetailsSimilarListings({
  title,
  listings,
}: PropertyDetailsSimilarListingsProps) {
  if (listings.length === 0) return null;

  return (
    <PropertyDetailsSection title={title} className="mt-6">
      <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
        {listings.map((listing) => {
          const href = buildPropertyDetailsUrl({
            id: listing.id,
            bedrooms: listing.bedrooms,
            carpetArea: listing.carpetAreaMin,
            carpetAreaUnit: listing.carpetAreaUnit,
            propertySubType: listing.propertySubType,
            propertyType: listing.propertyType,
            listingType: listing.listingType,
            locality: listing.locality,
            city: listing.city,
          });

          return (
            <article
              key={listing.id}
              className="w-[calc((100%-0.75rem)/1.5)] shrink-0 snap-start overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:w-[calc((100%-0.75rem)/2)] lg:w-[calc((100%-2.25rem)/4)]"
            >
              <Link href={href} className="block cursor-pointer">
                <div className="relative aspect-16/10 bg-slate-100">
                  {listing.imageUrl ? (
                    <img
                      src={listing.imageUrl}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-1 text-sm font-bold text-navy-blue">{listing.title}</h3>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{listing.subtitle}</p>
                  <PropertyListPrice item={listing} className="!mt-1 text-sm" />
                </div>
              </Link>
              <div className="border-t border-slate-100 px-3 pb-3">
                <button
                  type="button"
                  className="mt-2 w-full cursor-pointer rounded-lg border border-sky-200 bg-sky-50 py-2 text-xs font-semibold text-sky-800"
                >
                  {propertyDetailsContactLabel(listing.postedBy)}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </PropertyDetailsSection>
  );
}
