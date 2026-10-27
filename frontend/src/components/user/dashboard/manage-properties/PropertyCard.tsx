"use client";

import { Archive, Building2, Pencil, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { getAssetUrl } from "@/services/apiClient";
import type { PropertyListItem } from "@/services/property.service";
import PropertyRejectionNotice from "./PropertyRejectionNotice";
import {
  STATUS_ACTION_LABELS,
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
  formatPostedDate,
  formatPrice,
  getEditHref,
  getListingLabel,
  getStatusAction,
  getSubtitle,
  type StatusAction,
} from "./managePropertiesShared";

const actionButtonClassName =
  "inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const listingActionButtonClassName =
  "inline-flex min-h-11 w-full basis-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const LISTING_ACTION_STYLES = {
  close: {
    button:
      "border-amber-200/90 bg-amber-50/80 text-amber-950 hover:border-amber-300 hover:bg-amber-100/80 focus-visible:outline-amber-500",
    icon: "text-amber-700 ring-amber-200/90",
  },
  reopen: {
    button:
      "border-emerald-200/90 bg-emerald-50/80 text-emerald-950 hover:border-emerald-300 hover:bg-emerald-100/80 focus-visible:outline-emerald-500",
    icon: "text-emerald-700 ring-emerald-200/90",
  },
} as const;

type PropertyCardProps = {
  property: PropertyListItem;
  isBusy: boolean;
  onDelete: (property: PropertyListItem) => void;
  onStatusAction: (property: PropertyListItem, action: StatusAction) => void;
};

export default function PropertyCard({ property, isBusy, onDelete, onStatusAction }: PropertyCardProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const statusAction = getStatusAction(property.status);
  const showImage = property.mainImage && !hasImageError;

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,.08),0_4px_12px_rgba(15,23,42,.04)] transition hover:-translate-y-0.5 hover:border-slate-300/90 hover:shadow-lg ${
        isBusy ? "opacity-60" : ""
      }`}
      aria-busy={isBusy}
    >
      <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getAssetUrl(property.mainImage as string)}
            alt={property.title}
            loading="lazy"
            onError={() => setHasImageError(true)}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
            <Building2 className="h-10 w-10" aria-hidden />
            <span className="text-xs font-medium">No image</span>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-navy-blue shadow">
          {getListingLabel(property)}
        </span>
        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold shadow ${STATUS_BADGE_CLASSES[property.status]}`}
        >
          {STATUS_LABELS[property.status]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4 sm:p-5">
        <h2 className="truncate text-base font-bold text-slate-900 sm:text-lg" title={property.title}>
          {property.title}
        </h2>
        <p className="truncate text-sm text-slate-500">{getSubtitle(property)}</p>
        <p className="mt-2 text-xl font-bold text-navy-blue">{formatPrice(property)}</p>
        <p className="text-xs text-slate-400">
          Posted {formatPostedDate(property.createdAt)}
        </p>

        {property.status === "rejected" ? (
          <PropertyRejectionNotice propertyId={property.id} reason={property.rejectionReason} />
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={getEditHref(property.id)}
            aria-label={`Edit ${property.title}`}
            aria-disabled={isBusy}
            className={`${actionButtonClassName} border-sky-300 text-sky-600 hover:bg-sky-50 focus-visible:outline-sky-500`}
          >
            <Pencil className="h-4 w-4" aria-hidden />
            Edit
          </Link>
          <button
            type="button"
            disabled={isBusy}
            aria-label={`Delete ${property.title}`}
            onClick={() => onDelete(property)}
            className={`${actionButtonClassName} border-red-300 text-red-600 hover:bg-red-50 focus-visible:outline-red-500`}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Delete
          </button>
          {statusAction === "close" || statusAction === "reopen" ? (
            <button
              type="button"
              disabled={isBusy}
              aria-label={`${STATUS_ACTION_LABELS[statusAction]} ${property.title}`}
              onClick={() => onStatusAction(property, statusAction)}
              className={`${listingActionButtonClassName} ${LISTING_ACTION_STYLES[statusAction].button}`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ${LISTING_ACTION_STYLES[statusAction].icon}`}
              >
                {statusAction === "close" ? (
                  <Archive className="h-4 w-4" aria-hidden />
                ) : (
                  <RotateCcw className="h-4 w-4" aria-hidden />
                )}
              </span>
              {STATUS_ACTION_LABELS[statusAction]}
            </button>
          ) : statusAction ? (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onStatusAction(property, statusAction)}
              className={`${actionButtonClassName} basis-full border-emerald-300 text-emerald-600 hover:bg-emerald-50 focus-visible:outline-emerald-500`}
            >
              {STATUS_ACTION_LABELS[statusAction]}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
