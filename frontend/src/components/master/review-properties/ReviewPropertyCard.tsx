"use client";

import { Building2, Check, Eye, Mail, Phone, X } from "lucide-react";
import { useState } from "react";
import { getAssetUrl } from "@/services/apiClient";
import type { ReviewListItem } from "@/services/propertyReview.service";
import {
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
  formatPostedDate,
  formatPrice,
  getHeading,
  getListingLabel,
  getSubtitle,
} from "@/components/user/dashboard/manage-properties/managePropertiesShared";

const buttonClassName =
  "inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

type ReviewPropertyCardProps = {
  property: ReviewListItem;
  isBusy: boolean;
  onView: (property: ReviewListItem) => void;
  onApprove: (property: ReviewListItem) => void;
  onReject: (property: ReviewListItem) => void;
};

export default function ReviewPropertyCard({ property, isBusy, onView, onApprove, onReject }: ReviewPropertyCardProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const showImage = property.mainImage && !hasImageError;
  const canDecide = property.status === "pending";

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
        <h2 className="truncate text-base font-bold text-slate-900 sm:text-lg" title={getHeading(property)}>
          {getHeading(property)}
        </h2>
        <p className="truncate text-sm text-slate-500">{getSubtitle(property)}</p>
        <p className="mt-2 text-xl font-bold text-navy-blue">{formatPrice(property)}</p>
        <p className="text-xs text-slate-400">Posted {formatPostedDate(property.createdAt)}</p>

        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">{property.owner.name}</p>
          <p className="mt-1 flex items-center gap-2 truncate">
            <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {property.owner.email}
          </p>
          <p className="mt-1 flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {property.owner.mobile}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            aria-label={`View details for ${property.title}`}
            onClick={() => onView(property)}
            className="inline-flex min-h-11 w-full basis-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-sky-200 hover:bg-sky-50/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-blue"
          >
            <span className="bg-linear-to-r-navy-blue flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-sm">
              <Eye className="h-4 w-4" aria-hidden />
            </span>
            View details
          </button>
          {canDecide ? (
            <>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => onApprove(property)}
                className={`${buttonClassName} border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:outline-emerald-500`}
              >
                <Check className="h-4 w-4" aria-hidden />
                Approve
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => onReject(property)}
                className={`${buttonClassName} border-red-200 text-red-600 hover:bg-red-50 focus-visible:outline-red-500`}
              >
                <X className="h-4 w-4" aria-hidden />
                Reject
              </button>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}
