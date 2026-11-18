"use client";

import { MapPin, Share2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { SavedProperty } from "@/services/savedProperties.service";
import { getViewPropertyHref, humanizeSlug } from "../contacted-properties/contactedPropertiesShared";
import SavedPropertyImageSlider from "./SavedPropertyImageSlider";
import {
  getSavedImages,
  getSavedLocation,
  getSavedPriceLabel,
  isSavedListing,
  SAVED_CARD_IMAGE_ASPECT_CLASS,
} from "./savedPropertiesShared";

type PropertyActivityCardProps = {
  item: Pick<SavedProperty, "isAvailable" | "property">;
  action: ReactNode;
  isNew?: boolean;
};

export const CARD_ICON_BUTTON_CLASS_NAME =
  "inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border transition";

// Property card shared by the saved and seen pages; the page supplies the heart action
export default function PropertyActivityCard({ item, action, isNew = false }: PropertyActivityCardProps) {
  const { property } = item;
  const listing = isSavedListing(property) ? property : null;
  const href = listing ? getViewPropertyHref(listing) : null;
  const listerName = listing?.builderName ?? listing?.listerName ?? "Private listing";
  const categoryLabel = listing?.categoryLabel ?? humanizeSlug(property.propertyType);

  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <div className="relative">
        {listing && href ? (
          <SavedPropertyImageSlider images={getSavedImages(listing)} alt={listing.title} href={href} />
        ) : (
          <div
            className={`flex items-center justify-center bg-slate-100 text-sm font-semibold text-slate-500 ${SAVED_CARD_IMAGE_ASPECT_CLASS}`}
          >
            Photos unavailable
          </div>
        )}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
          {item.isAvailable && isNew ? (
            <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow">
              New
            </span>
          ) : null}
          {item.isAvailable ? null : (
            <span className="rounded-full bg-slate-800/85 px-2.5 py-1 text-[11px] font-semibold text-white shadow">
              No longer available
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {href ? (
              <Link href={href} className="block truncate text-base font-bold text-slate-900 hover:text-navy-blue">
                {property.title}
              </Link>
            ) : (
              <p className="truncate text-base font-bold text-slate-900">{property.title}</p>
            )}
            <p className="mt-0.5 truncate text-sm text-slate-500">{listing ? listerName : "Listing closed"}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label="Share property"
              className={`${CARD_ICON_BUTTON_CLASS_NAME} border-slate-200 text-slate-500 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700`}
            >
              <Share2 className="h-4 w-4" aria-hidden />
            </button>
            {action}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-sm text-slate-600">
          <MapPin className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
          <span className="truncate">{getSavedLocation(property)}</span>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <p 
            className="min-w-0 truncate text-base font-bold text-navy-blue"
            title={categoryLabel}>
              {categoryLabel}
            </p>
          <p className="shrink-0 text-base font-bold text-navy-blue">
            {listing ? getSavedPriceLabel(listing) : null}
          </p>
        </div>
      </div>
    </li>
  );
}
