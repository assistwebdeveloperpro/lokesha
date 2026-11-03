"use client";

import { MapPin } from "lucide-react";
import PropertyListPrice from "@/components/user/dashboard/manage-properties/PropertyListPrice";
import { formatSearchListingArea } from "@/components/landing/property-search/property-list/formatSearchListingArea";
import { PropertyDetailsAboutTabs } from "./PropertyDetailsAboutTabs";
import { PropertyDetailsAmenityGrid } from "./PropertyDetailsAmenityGrid";
import { PropertyDetailsBreadcrumbs } from "./PropertyDetailsBreadcrumbs";
import { PropertyDetailsDeveloperCard } from "./PropertyDetailsDeveloperCard";
import { PropertyDetailsFloorPlans } from "./PropertyDetailsFloorPlans";
import { PropertyDetailsGallery } from "./PropertyDetailsGallery";
import { PropertyDetailsHeaderActions } from "./PropertyDetailsHeaderActions";
import { PropertyDetailsHighlightCards } from "./PropertyDetailsHighlightCards";
import { PropertyDetailsMapPlaceholder } from "./PropertyDetailsMapPlaceholder";
import { PropertyDetailsSection } from "./PropertyDetailsSection";
import { PropertyDetailsSimilarListings } from "./PropertyDetailsSimilarListings";
import { PropertyDetailsSummaryCard } from "./PropertyDetailsSummaryCard";
import { propertyContactDisplayName } from "@/components/landing/property-contact/propertyContactDisplayName";
import { propertyDetailsContactLabel } from "./propertyDetailsContactLabel";
import { propertyDetailsHeroPriceLabel } from "./propertyDetailsPriceLabel";
import type { PropertyDetailsView } from "./propertyDetails.types";

const PAGE_CONTAINER = "mx-auto w-full max-w-360 px-2 sm:px-4 lg:px-6";
const HERO_GRID =
  "grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2 lg:gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]";

type PropertyDetailsPageContentProps = {
  details: PropertyDetailsView;
};

function bedroomConfigLabel(bedrooms: number[]): string {
  if (bedrooms.length === 0) return "Flat/Apartment";
  const unique = [...new Set(bedrooms)].sort((a, b) => a - b).join(", ");
  return `${unique} BHK Flat/Apartment`;
}

export function PropertyDetailsPageContent({ details }: PropertyDetailsPageContentProps) {
  const { listing } = details;
  const areaLabel = formatSearchListingArea(listing);
  const bhkLabel = bedroomConfigLabel(listing.bedrooms);
  const isProject = details.kind === "project";
  const contactLabel = propertyDetailsContactLabel(details.poster.postedBy);
  const contactName = propertyContactDisplayName(
    details.poster.postedBy,
    details.poster.postedBy === "builder" ? listing.builderName : details.poster.name,
  );
  const summaryTitle = isProject ? "Project Details" : "Property Details";
  const summaryGroups = isProject
    ? [{ rows: details.overviewRows }]
    : [{ rows: [...details.propertyDetailRows, ...details.pricingRows] }];

  return (
    <div className="bg-slate-50/60 pb-10">
      <div className={`${PAGE_CONTAINER} pt-3 sm:pt-4`}>
        <PropertyDetailsBreadcrumbs items={details.breadcrumbs} />

        <div className="mt-3 flex flex-col gap-3 lg:mt-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
          <header className="min-w-0 flex-1 space-y-1.5">
            <h1 className="font-display text-xl font-bold leading-tight text-navy-blue sm:text-2xl lg:text-2xl">
              {details.headlineTitle}
            </h1>
            {isProject && listing.builderName ? (
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:text-sm">
                By {listing.builderName}
              </p>
            ) : null}
            <p className="flex items-center gap-1.5 text-sm text-slate-600">
              <MapPin className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
              <span>
                {listing.locality}, {listing.city}
              </span>
            </p>
            {!isProject ? (
              <p className="text-sm text-slate-600 sm:text-base">{details.headlineSubtitle}</p>
            ) : null}
          </header>

          <PropertyDetailsHeaderActions
            contactLabel={contactLabel}
            postedBy={details.poster.postedBy}
            contactName={contactName}
            showBrochure={listing.hasBrochure}
          />
        </div>

        <div className={`mt-3 sm:mt-4 ${HERO_GRID}`}>
          <div className="min-w-0 space-y-3">
            <PropertyDetailsGallery
              layout="hero"
              images={details.images}
              title={listing.title}
              showBrochure={listing.hasBrochure}
            />

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-5 sm:py-4">
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                {propertyDetailsHeroPriceLabel(listing)}
              </p>
              <PropertyListPrice item={listing} className="mt-0.5! text-xl sm:text-2xl" />
              {isProject ? (
                <div className="mt-3">
                  <PropertyDetailsHighlightCards
                    bhkLabel={bhkLabel}
                    possessionLabel={details.possessionLabel}
                  />
                </div>
              ) : null}
            </div>
          </div>

          <PropertyDetailsSummaryCard title={summaryTitle} groups={summaryGroups} />
        </div>

        <div className="mt-6 space-y-6 lg:mt-8">
          {isProject ? (
            <PropertyDetailsSection title={`About ${listing.title}`}>
              <PropertyDetailsAboutTabs
                title={listing.title}
                address={details.address}
                description={details.description}
              />
            </PropertyDetailsSection>
          ) : (
            <PropertyDetailsSection title="Description">
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                {details.description}
              </p>
              <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-sm text-slate-600">
                <span className="font-semibold text-slate-800">Posted by:</span>{" "}
                {details.poster.name}
              </div>
            </PropertyDetailsSection>
          )}

          <PropertyDetailsSection title={`${listing.title} - Amenities Details`}>
            <PropertyDetailsAmenityGrid items={details.amenities} />
          </PropertyDetailsSection>

          {!isProject && details.furnishingItems.length > 0 ? (
            <PropertyDetailsSection title={`${listing.title} - Furnishing Details`}>
              <PropertyDetailsAmenityGrid items={details.furnishingItems} variant="furnishing" />
            </PropertyDetailsSection>
          ) : null}

          <PropertyDetailsSection title={`${listing.title} - Location`}>
            <PropertyDetailsMapPlaceholder title={listing.title} address={details.address} />
          </PropertyDetailsSection>

          {isProject ? (
            <PropertyDetailsSection title={`${listing.title} -  Floor Plan`}>
              <PropertyDetailsFloorPlans
                projectName={listing.title}
                plans={details.floorPlans}
                configurations={details.bhkConfigurations}
              />
            </PropertyDetailsSection>
          ) : null}

          {isProject ? <PropertyDetailsDeveloperCard developer={details.developer} /> : null}

          {!isProject ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 sm:text-sm">
              Carpet / built-up summary: {areaLabel}
            </div>
          ) : null}
        </div>

        <PropertyDetailsSimilarListings
          title={
            isProject
              ? `Similar Projects in ${listing.locality}, ${listing.city}`
              : `Similar Properties in ${listing.locality}, ${listing.city}`
          }
          listings={details.similarListings}
        />
      </div>
    </div>
  );
}
