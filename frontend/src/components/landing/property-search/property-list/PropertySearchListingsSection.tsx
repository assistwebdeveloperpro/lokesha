"use client";

import type { ReactNode } from "react";
import ListPagination from "@/components/shared/ui/ListPagination";
import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import { PropertySearchListExplorePrompt } from "./PropertySearchListExplorePrompt";
import { PropertySearchListingCard } from "./PropertySearchListingCard";
import type { PublicSearchListing } from "./publicSearchListing.types";

const EXPLORE_AFTER_INDEX = 2;

type PropertySearchListingsSectionProps = {
  listings: PublicSearchListing[];
  criteria: PropertySearchCriteria;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPickLocality: (locality: string) => void;
  onClearLocalities: () => void;
};

export function PropertySearchListingsSection({
  listings,
  criteria,
  total,
  page,
  pageSize,
  onPageChange,
  onPickLocality,
  onClearLocalities,
}: PropertySearchListingsSectionProps) {
  const nodes: ReactNode[] = [];

  listings.forEach((listing, index) => {
    nodes.push(
      <li key={listing.id}>
        <PropertySearchListingCard listing={listing} featured={index === 0 && page === 1} />
      </li>,
    );
    if (index === EXPLORE_AFTER_INDEX) {
      nodes.push(
        <PropertySearchListExplorePrompt
          key="explore-prompt"
          criteria={criteria}
          total={total}
          onPickLocality={onPickLocality}
          onClearLocalities={onClearLocalities}
        />,
      );
    }
  });

  return (
    <section aria-label="Property listings" className="min-w-0">
      <ul className="space-y-4 sm:space-y-5">{nodes}</ul>
      <ListPagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
      />
    </section>
  );
}
