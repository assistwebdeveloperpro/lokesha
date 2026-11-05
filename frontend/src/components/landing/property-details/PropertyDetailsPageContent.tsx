"use client";

import {
  Award,
  Armchair,
  Layers,
  LayoutGrid,
  MapPin,
  CircleHelp,
  ScrollText,
} from "lucide-react";
import { PropertyDetailsAboutTabs } from "./PropertyDetailsAboutTabs";
import { PropertyDetailsAmenityGrid } from "./PropertyDetailsAmenityGrid";
import { PropertyDetailsBreadcrumbs } from "./PropertyDetailsBreadcrumbs";
import { PropertyDetailsDeveloperCard } from "./PropertyDetailsDeveloperCard";
import { PropertyDetailsFaqs } from "./PropertyDetailsFaqs";
import {
  hasPropertyDetailsFloorPlans,
  PropertyDetailsFloorPlans,
} from "./PropertyDetailsFloorPlans";
import { PropertyDetailsGallery } from "./PropertyDetailsGallery";
import { PropertyDetailsHeaderActions } from "./PropertyDetailsHeaderActions";
import { PropertyDetailsMapPlaceholder } from "./PropertyDetailsMapPlaceholder";
import { PropertyDetailsNearbyPlaces } from "./PropertyDetailsNearbyPlaces";
import { PropertyDetailsProjectUsps } from "./PropertyDetailsProjectUsps";
import { PropertyDetailsSection } from "./PropertyDetailsSection";
import { PropertyDetailsSimilarListings } from "./PropertyDetailsSimilarListings";
import { PropertyDetailsSummaryCard } from "./PropertyDetailsSummaryCard";
import { propertyContactDisplayName } from "@/components/landing/property-contact/propertyContactDisplayName";
import { propertyDetailsContactLabel } from "./propertyDetailsContactLabel";
import { PropertyDetailsHeroPriceSection } from "./PropertyDetailsHeroPriceSection";
import {
  hasPropertyDetailsAboutSection,
  hasPropertyDetailsDeveloperSection,
  hasPropertyDetailsFaqs,
  hasPropertyDetailsText,
} from "./propertyDetailsSectionVisibility";
import type { PropertyDetailsView } from "./propertyDetails.types";

const PAGE_CONTAINER = "mx-auto w-full max-w-360 px-2 sm:px-4 lg:px-6";
const HERO_GRID =
  "grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2 lg:gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]";

const withoutPriceNegotiable = <T extends { label: string }>(rows: T[]) =>
  rows.filter((row) => row.label.toLowerCase() !== "price negotiable");

type PropertyDetailsPageContentProps = {
  details: PropertyDetailsView;
};

export function PropertyDetailsPageContent({ details }: PropertyDetailsPageContentProps) {
  const { listing } = details;
  const isProject = details.kind === "project";
  const contactLabel = propertyDetailsContactLabel(details.poster.postedBy);
  const contactName = propertyContactDisplayName(
    details.poster.postedBy,
    details.poster.postedBy === "builder" ? listing.builderName : details.poster.name,
  );
  const summaryTitle = isProject ? "Project Details" : "Property Details";
  const summaryGroups = isProject
    ? [{ rows: withoutPriceNegotiable([...details.overviewRows, ...details.pricingRows]) }]
    : [
        {
          rows: withoutPriceNegotiable([...details.propertyDetailRows, ...details.pricingRows]),
        },
      ];
  const showAboutSection = hasPropertyDetailsAboutSection(details.description, details.address);
  const showAmenitiesSection = details.amenities.length > 0;
  const showLocationSection = hasPropertyDetailsText(details.address);
  const showFloorPlanSection =
    details.kind === "project" &&
    hasPropertyDetailsFloorPlans(details.floorPlans, details.bhkConfigurations);
  const showDeveloperSection =
    details.kind === "project" && hasPropertyDetailsDeveloperSection(details.developer);
  const showFaqsSection = hasPropertyDetailsFaqs(details.faqs);

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

            <PropertyDetailsHeroPriceSection listing={listing} />
          </div>

          <PropertyDetailsSummaryCard title={summaryTitle} groups={summaryGroups} />
        </div>

        <div className="mt-6 space-y-6 lg:mt-8">
          {showAboutSection ? (
            <PropertyDetailsSection title={details.aboutSectionTitle} icon={ScrollText}>
              <PropertyDetailsAboutTabs
                title={listing.title}
                address={details.address}
                description={details.description}
              />
            </PropertyDetailsSection>
          ) : null}

          {isProject && details.projectUsps.length > 0 ? (
            <PropertyDetailsSection title="Project USPs" icon={Award}>
              <PropertyDetailsProjectUsps items={details.projectUsps} />
            </PropertyDetailsSection>
          ) : null}

          {details.nearbyPlaces.length > 0 ? (
            <PropertyDetailsSection title="Location" icon={MapPin}>
              <PropertyDetailsNearbyPlaces items={details.nearbyPlaces} />
            </PropertyDetailsSection>
          ) : null}

          {showAmenitiesSection ? (
            <PropertyDetailsSection
              title={`${listing.title} - Amenities Details`}
              icon={LayoutGrid}
            >
              <PropertyDetailsAmenityGrid items={details.amenities} />
            </PropertyDetailsSection>
          ) : null}

          {!isProject && details.furnishingItems.length > 0 ? (
            <PropertyDetailsSection title="Furnishing Details" icon={Armchair}>
              <PropertyDetailsAmenityGrid items={details.furnishingItems} />
            </PropertyDetailsSection>
          ) : null}

          {showLocationSection ? (
            <PropertyDetailsSection title="Location" icon={MapPin}>
              <PropertyDetailsMapPlaceholder title={listing.title} address={details.address} />
            </PropertyDetailsSection>
          ) : null}

          {showFloorPlanSection ? (
            <PropertyDetailsSection title={`${listing.title} - Floor Plans`} icon={Layers}>
              <PropertyDetailsFloorPlans
                projectName={listing.title}
                plans={details.floorPlans}
                configurations={details.bhkConfigurations}
              />
            </PropertyDetailsSection>
          ) : null}

          {showDeveloperSection ? (
            <PropertyDetailsDeveloperCard developer={details.developer} />
          ) : null}

          {showFaqsSection ? (
            <PropertyDetailsSection title="FAQs" icon={CircleHelp}>
              <PropertyDetailsFaqs items={details.faqs} />
            </PropertyDetailsSection>
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
