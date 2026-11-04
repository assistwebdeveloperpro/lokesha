"use client";

import { FileDown, Heart, Share2 } from "lucide-react";
import { useState } from "react";
import { PropertyContactSuccessModal } from "@/components/landing/property-contact/PropertyContactSuccessModal";
import type { PublicSearchPostedBy } from "@/components/landing/property-search/property-list/publicSearchListing.types";

type PropertyDetailsHeaderActionsProps = {
  contactLabel: string;
  postedBy: PublicSearchPostedBy;
  contactName: string;
  showBrochure?: boolean;
};

export function PropertyDetailsHeaderActions({
  contactLabel,
  postedBy,
  contactName,
  showBrochure = false,
}: PropertyDetailsHeaderActionsProps) {
  const [saved, setSaved] = useState(false);
  const [showContactSuccess, setShowContactSuccess] = useState(false);

  return (
    <>
    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 lg:shrink-0 lg:flex-nowrap">
      <button
        type="button"
        className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-sky-200 hover:bg-sky-50/80 hover:text-sky-700"
        aria-label="Share property"
      >
        <Share2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setSaved((value) => !value)}
        className={`inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border bg-white shadow-sm transition ${
          saved
            ? "border-rose-200 bg-rose-50/80 text-rose-600"
            : "border-slate-200 text-slate-600 hover:border-sky-200 hover:bg-sky-50/80 hover:text-sky-700"
        }`}
        aria-label={saved ? "Remove from saved" : "Save property"}
      >
        <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
      </button>
      <button
        type="button"
        onClick={() => setShowContactSuccess(true)}
        className="shrink-0 cursor-pointer rounded-xl bg-navy-blue px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/15 transition hover:opacity-95"
      >
        {contactLabel}
      </button>
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
    {showContactSuccess ? (
      <PropertyContactSuccessModal
        postedBy={postedBy}
        contactName={contactName}
        onClose={() => setShowContactSuccess(false)}
      />
    ) : null}
    </>
  );
}
