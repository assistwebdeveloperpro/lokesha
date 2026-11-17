"use client";

import { FileDown, Share2 } from "lucide-react";
import { PropertyContactButton } from "@/components/landing/property-contact/PropertyContactButton";
import { SavePropertyButton } from "@/components/landing/saved-properties/SavePropertyButton";
import type { PublicSearchPostedBy } from "@/components/landing/property-search/property-list/publicSearchListing.types";

type PropertyDetailsHeaderActionsProps = {
  postedBy: PublicSearchPostedBy;
  propertyId: string;
  showBrochure?: boolean;
};

export function PropertyDetailsHeaderActions({
  postedBy,
  propertyId,
  showBrochure = false,
}: PropertyDetailsHeaderActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 lg:shrink-0 lg:flex-nowrap">
      <button
        type="button"
        className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-sky-200 hover:bg-sky-50/80 hover:text-sky-700"
        aria-label="Share property"
      >
        <Share2 className="h-4 w-4" />
      </button>
      <SavePropertyButton propertyId={propertyId} />
      <PropertyContactButton
        propertyId={propertyId}
        postedBy={postedBy}
        className="shrink-0 cursor-pointer rounded-xl bg-navy-blue px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/15 transition hover:opacity-95"
      />
      {showBrochure ? (
        <button
          type="button"
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy-blue shadow-sm transition hover:border-sky-200 hover:bg-sky-50/50"
        >
          <FileDown className="h-4 w-4" aria-hidden />
          Brochure
        </button>
      ) : null}
    </div>
  );
}
