"use client";

import { Building2, CalendarDays, CircleCheck, CircleX, Hash, Pencil, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
  formatPostedDate,
  formatPrice,
  getHeading,
  getListingLabel,
  getSubtitle,
} from "@/components/user/dashboard/manage-properties/managePropertiesShared";
import type { ManageListItem } from "@/services/adminManageProperties.service";
import { getAssetUrl } from "@/services/apiClient";

const EDIT_PATH = "/backend/properties/post-property";

const actionButtonClassName =
  "inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

type ManagePropertyCardProps = {
  property: ManageListItem;
  isBusy: boolean;
  showSourceBadge?: boolean;
  onPublish: (property: ManageListItem) => void;
  onClose: (property: ManageListItem) => void;
};

export default function ManagePropertyCard({
  property,
  isBusy,
  showSourceBadge = true,
  onPublish,
  onClose,
}: ManagePropertyCardProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const showImage = property.mainImage && !hasImageError;
  // Admins edit any listing but only publish and close the ones created by admins
  const isAdminListing = property.listedBy.source === "admin";
  const canPublish = isAdminListing && (property.status === "draft" || property.status === "closed");
  const canClose = isAdminListing && property.status === "published";

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
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50/80">
          <div className="flex items-center justify-between gap-2 px-3 py-2.5">
            <span
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-sm font-bold tabular-nums text-navy-blue shadow-sm ring-1 ring-slate-200/80"
              aria-label={`Listing ID ${property.listingNumber}`}
            >
              <Hash className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
              {property.listingNumber}
            </span>
            {showSourceBadge ? (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  isAdminListing
                    ? "bg-sky-100 text-navy-blue"
                    : "bg-white text-slate-600 ring-1 ring-slate-200/90"
                }`}
              >
                {isAdminListing ? "Admin" : "User"}
              </span>
            ) : null}
          </div>
          <div className="divide-y divide-slate-100 border-t border-slate-200/80 bg-white">
            <p className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700">
              <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              {formatPostedDate(property.createdAt)}
            </p>
            {property.listedBy.name ? (
              <p className="flex min-w-0 items-center gap-2.5 px-3 py-2 text-sm text-slate-700">
                <UserRound className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                <span className="truncate font-medium" title={property.listedBy.name}>
                  {property.listedBy.name}
                </span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`${EDIT_PATH}?edit=${property.id}`}
            aria-label={`Edit ${property.title}`}
            aria-disabled={isBusy}
            className={`${actionButtonClassName} border-sky-300 text-sky-600 hover:bg-sky-50 focus-visible:outline-sky-500`}
          >
            <Pencil className="h-4 w-4" aria-hidden />
            Edit
          </Link>
          {canPublish ? (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onPublish(property)}
              className={`${actionButtonClassName} border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:outline-emerald-500`}
            >
              <CircleCheck className="h-4 w-4" aria-hidden />
              {property.status === "closed" ? "Re-publish" : "Publish"}
            </button>
          ) : null}
          {canClose ? (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onClose(property)}
              className={`${actionButtonClassName} border-red-200 text-red-600 hover:bg-red-50 focus-visible:outline-red-500`}
            >
              <CircleX className="h-4 w-4" aria-hidden />
              Mark as Closed
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
