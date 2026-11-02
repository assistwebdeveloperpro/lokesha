"use client";

import { BadgeCheck, BedDouble, Building2, Heart, Maximize2, Share2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PropertyContactSuccessModal } from "@/components/landing/property-contact/PropertyContactSuccessModal";
import { propertyContactDisplayName } from "@/components/landing/property-contact/propertyContactDisplayName";
import { propertyDetailsContactLabel } from "@/components/landing/property-details/propertyDetailsContactLabel";
import PropertyListPrice from "@/components/user/dashboard/manage-properties/PropertyListPrice";
import { buildPropertyDetailsUrl } from "@/lib/property-search-url/propertyDetailsUrl";
import { formatSearchListingArea } from "./formatSearchListingArea";
import type { PublicSearchListing } from "./publicSearchListing.types";

type PropertySearchListingCardProps = {
  listing: PublicSearchListing;
  featured?: boolean;
};

const postedByLabel = (postedBy: PublicSearchListing["postedBy"]) =>
  postedBy === "owner" ? "Owner" : postedBy === "dealer" ? "Dealer" : "Builder";

function bedroomLabel(bedrooms: number[]) {
  if (bedrooms.length === 0) return null;
  const unique = [...new Set(bedrooms)].sort((a, b) => a - b);
  return `${unique.join(", ")} BHK`;
}

export function PropertySearchListingCard({
  listing,
  featured = false,
}: PropertySearchListingCardProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const [showContactSuccess, setShowContactSuccess] = useState(false);
  const detailsHref = buildPropertyDetailsUrl({
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

  const showImage = listing.imageUrl && !hasImageError;
  const areaLabel = formatSearchListingArea(listing);
  const bhk = bedroomLabel(listing.bedrooms);

  const contactName = propertyContactDisplayName(listing.postedBy, listing.builderName);

  return (
    <>
    <article
      className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        featured
          ? "border-sky-200 ring-1 ring-sky-100"
          : "border-slate-200 hover:border-sky-200/80"
      }`}
    >
      <div className="flex flex-col lg:flex-row">
        <Link
          href={detailsHref}
          className="relative block aspect-16/10 w-full shrink-0 overflow-hidden bg-slate-100 lg:aspect-auto lg:min-h-60 lg:w-[38%] lg:max-w-88"
        >
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.imageUrl as string}
              alt={listing.title}
              loading="lazy"
              onError={() => setHasImageError(true)}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] lg:absolute lg:inset-0 lg:min-h-full"
            />
          ) : (
            <div className="flex h-full min-h-44 w-full flex-col items-center justify-center gap-2 text-slate-400">
              <Building2 className="h-10 w-10" aria-hidden />
              <span className="text-xs font-medium">No image</span>
            </div>
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {featured ? (
              <span className="rounded-full bg-sky-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                Top pick
              </span>
            ) : null}
            <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700 shadow-sm backdrop-blur-sm">
              {postedByLabel(listing.postedBy)}
            </span>
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-slate-950/70 to-transparent px-3 pb-3 pt-10 sm:px-4 sm:pb-4"
            aria-hidden
          />
          <p className="absolute bottom-0 left-0 right-0 px-3 pb-3 text-[10px] font-semibold uppercase tracking-wider text-white sm:px-4 sm:pb-4 sm:text-xs">
            {listing.categoryLabel}
          </p>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <Link href={detailsHref} className="group/title min-w-0 flex-1">
              <h3 className="font-display text-lg font-bold leading-snug text-slate-900 transition group-hover/title:text-navy-blue sm:text-xl">
                {listing.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">{listing.subtitle}</p>
            </Link>
            {listing.reraRegistered ? (
              <span className="inline-flex shrink-0 items-center gap-0.5 rounded-lg bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                <BadgeCheck className="h-3 w-3" aria-hidden />
                RERA
              </span>
            ) : null}
          </div>

          <PropertyListPrice
            item={{
              price: listing.price,
              priceMin: listing.priceMin,
              priceMax: listing.priceMax,
              listingType: listing.listingType,
            }}
            className="mt-2! text-base! font-bold! sm:text-lg! md:text-lg! lg:text-lg!"
          />

          <ul className="mt-3 flex flex-wrap gap-2">
            {bhk ? (
              <li className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 sm:text-sm">
                <BedDouble className="h-3.5 w-3.5 text-sky-600" aria-hidden />
                {bhk}
              </li>
            ) : null}
            <li className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 sm:text-sm">
              <Maximize2 className="h-3.5 w-3.5 text-sky-600" aria-hidden />
              {areaLabel}
            </li>
            <li className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 sm:text-sm">
              <span className="text-slate-500">
                {listing.constructionStatus === "Ready to Move" ? "Status" : "Launch"}
              </span>
              <span className="truncate">
                {listing.launchOrPossessionLabel ?? listing.constructionStatus ?? "—"}
              </span>
            </li>
          </ul>

          <div className="mt-auto w-full min-w-0 pt-4">
          <div className="flex w-full min-w-0 flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
            <div className="flex min-w-0 max-w-full items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
                <Building2 className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {listing.builderName ?? "Private listing"}
                </p>
                <p className="text-xs text-slate-500">
                  {listing.locality}, {listing.city}
                </p>
              </div>
            </div>

            <div className="ml-auto flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
              <button
                type="button"
                aria-label="Save property"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:cursor-pointer hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
              >
                <Heart className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Share property"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:cursor-pointer hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
              >
                <Share2 className="h-4 w-4" aria-hidden />
              </button>
              {listing.hasBrochure ? (
                <button
                  type="button"
                  className="inline-flex min-h-10 shrink-0 items-center hover:cursor-pointer rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Brochure
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setShowContactSuccess(true)}
                className="inline-flex min-h-10 shrink-0 items-center rounded-xl bg-navy-blue px-4 text-xs font-semibold text-white transition hover:cursor-pointer hover:opacity-90 sm:text-sm"
              >
                {propertyDetailsContactLabel(listing.postedBy)}
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </article>
    {showContactSuccess ? (
      <PropertyContactSuccessModal
        postedBy={listing.postedBy}
        contactName={contactName}
        onClose={() => setShowContactSuccess(false)}
      />
    ) : null}
    </>
  );
}
