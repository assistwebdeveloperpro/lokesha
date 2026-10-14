"use client";

import { Bath, BedDouble, ImageOff, MapPin, Maximize, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { getAssetUrl } from "@/services/apiClient";
import type { PropertySummary } from "@/services/property.service";
import {
  LISTING_TYPE_LABELS,
  STATUS_META,
  formatPostedDate,
  formatPrice,
  getEditPropertyHref,
  getLocationLabel,
} from "./manageProperties.shared";

type PropertyCardProps = {
  property: PropertySummary;
  onDelete: (property: PropertySummary) => void;
};

export default function PropertyCard({ property, onDelete }: PropertyCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const status = STATUS_META[property.status];
  const showImage = property.mainImage && !imageFailed;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getAssetUrl(property.mainImage as string)}
            alt={property.projectName}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
            <ImageOff className="h-8 w-8" aria-hidden />
            <span className="text-xs font-medium">No image</span>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-navy-blue/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {LISTING_TYPE_LABELS[property.listingType] ?? property.listingType}
        </span>
        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div>
          <h2 className="truncate text-base font-bold text-slate-800 sm:text-lg">
            {property.projectName}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{getLocationLabel(property)}</span>
          </p>
        </div>

        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
          {property.bedrooms !== null ? (
            <li className="flex items-center gap-1.5">
              <BedDouble className="h-4 w-4 text-slate-400" aria-hidden />
              {property.bedrooms} Bed
            </li>
          ) : null}
          {property.bathrooms !== null ? (
            <li className="flex items-center gap-1.5">
              <Bath className="h-4 w-4 text-slate-400" aria-hidden />
              {property.bathrooms} Bath
            </li>
          ) : null}
          {property.carpetArea !== null ? (
            <li className="flex items-center gap-1.5">
              <Maximize className="h-4 w-4 text-slate-400" aria-hidden />
              {property.carpetArea} {property.carpetAreaUnit}
            </li>
          ) : null}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-2 border-t border-slate-100 pt-3">
          <p className="text-xl font-bold text-navy-blue">
            {property.listingType === "rent-lease"
              ? `${formatPrice(property.monthlyRent)}/mo`
              : formatPrice(property.expectedPrice)}
          </p>
          <p className="text-xs text-slate-400">
            Posted {formatPostedDate(property.createdAt)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href={getEditPropertyHref(property.id)}
            aria-label={`Edit ${property.projectName}`}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 hover:border-sky-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            <Pencil className="h-4 w-4" aria-hidden />
            Edit
          </Link>
          <button
            type="button"
            onClick={() => onDelete(property)}
            aria-label={`Delete ${property.projectName}`}
            className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
