"use client";

import { Building2, Hash, Lock, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatSearchListingArea } from "@/components/landing/property-search/property-list/formatSearchListingArea";
import PropertyListPrice from "@/components/user/dashboard/manage-properties/PropertyListPrice";
import { formatTimeAgo } from "@/components/user/dashboard/notifications/formatTimeAgo";
import { getAssetUrl } from "@/services/apiClient";
import type { ContactedProperty } from "@/services/userContactedProperties.service";
import {
  CONTACT_ROLE_LABEL,
  CONTACTED_GRID_CLASS,
  CONTACTED_TABLE_COLUMNS,
  CONTACTED_TABLE_MIN_WIDTH_CLASS,
  formatContactedAt,
  getListingTypeLabel,
  getPropertyLocation,
  getViewPropertyHref,
  humanizeSlug,
  isSearchListing,
} from "./contactedPropertiesShared";

const chipClassName =
  "inline-flex w-fit items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200/70";

const iconBubbleClassName = (tone: string) =>
  `flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${tone}`;

const SUBSCRIPTION_HREF = "/user/subscription/subscribed-services";

const ACTION_BASE_CLASS =
  "inline-flex min-h-9 items-center justify-center rounded-xl px-3 md:px-4 text-xs md:text-xs font-semibold transition";

function PropertyThumbnail({ imageUrl }: { imageUrl: string | null }) {
  const [hasError, setHasError] = useState(false);

  return (
    <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-indigo-50 to-sky-100 text-indigo-600 ring-1 ring-indigo-100">
      {imageUrl && !hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={getAssetUrl(imageUrl)}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <Building2 className="h-6 w-6" aria-hidden />
      )}
    </span>
  );
}

function ContactedPropertyRow({ item }: { item: ContactedProperty }) {
  const { property, lister } = item;
  const listing = isSearchListing(property) ? property : null;
  const typeLabel = humanizeSlug(listing?.propertySubType ?? property.propertyType);
  const bedrooms = listing?.bedrooms.length ? `${listing.bedrooms.join("-")} BHK` : null;

  return (
    <li
      className={`grid gap-4 border-b border-slate-100 px-5 py-4 transition last:border-b-0 hover:bg-slate-50 ${CONTACTED_GRID_CLASS}`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <PropertyThumbnail imageUrl={listing?.imageUrl ?? null} />
        <div className="min-w-0 space-y-1.5">
          <p className="truncate text-sm font-bold text-slate-900" title={property.title}>
            {property.title}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {"listingNumber" in property ? (
              <span className="inline-flex items-center gap-0.5 rounded-md bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-white">
                <Hash className="h-2.5 w-2.5" aria-hidden />
                {property.listingNumber}
              </span>
            ) : null}
            <span className={chipClassName}>{typeLabel}</span>
            <span className={chipClassName}>{getListingTypeLabel(property.listingType)}</span>
          </div>
          <p className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span className={iconBubbleClassName("bg-rose-50 text-rose-500")}>
              <MapPin className="h-3 w-3" aria-hidden />
            </span>
            <span className="truncate">{getPropertyLocation(property)}</span>
          </p>
        </div>
      </div>

      <div className="min-w-0">
        {listing ? (
          <>
            <PropertyListPrice item={listing} className="mt-0! text-sm!" />
            <p className="mt-1 text-xs font-medium text-slate-500">
              {[bedrooms, formatSearchListingArea(listing)].filter((part) => part && part !== "—").join(" · ") || "—"}
            </p>
          </>
        ) : (
          <p className="text-sm text-slate-400">—</p>
        )}
      </div>

      <div className="flex min-w-0 flex-col items-start">
        <p className="w-full truncate text-sm font-semibold text-slate-900">{lister.name ?? "—"}</p>
        <span className="mt-1.5 inline-flex w-fit rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 ring-1 ring-sky-200">
          {CONTACT_ROLE_LABEL[item.contactRole]}
        </span>
        {item.phoneRevealed && lister.mobile ? (
          <p className="mt-1.5 flex items-center gap-2 text-xs font-medium text-slate-600">
            <span className={iconBubbleClassName("bg-emerald-50 text-emerald-600")}>
              <Phone className="h-3 w-3" aria-hidden />
            </span>
            {lister.mobile}
          </p>
        ) : (
          <Link
            href={SUBSCRIPTION_HREF}
            title="Subscribe to unlock the phone number"
            className="mt-1.5 inline-flex cursor-pointer items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-amber-600"
          >
            <Lock className="h-3.5 w-3.5" aria-hidden />
            Subscribe Package
          </Link>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-sm font-semibold text-slate-800">{formatTimeAgo(item.contactedAt)}</p>
          {item.isNew ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200">
              New
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-xs text-slate-500">{formatContactedAt(item.contactedAt)}</p>
      </div>

      <div className="min-w-0">
        <span
          className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${
            item.isAvailable
              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
              : "bg-slate-100 text-slate-600 ring-slate-200"
          }`}
        >
          {item.isAvailable ? "Available" : "No longer available"}
        </span>
      </div>

      <div className="min-w-0">
        {listing ? (
          <Link
            href={getViewPropertyHref(listing)}
            className={`${ACTION_BASE_CLASS} bg-linear-to-r-navy-blue text-white shadow-md hover:shadow-lg`}
          >
            View Property
          </Link>
        ) : (
          <button
            type="button"
            disabled
            title="This property is no longer available"
            className={`${ACTION_BASE_CLASS} cursor-not-allowed bg-slate-100 text-slate-400`}
          >
            View Property
          </button>
        )}
      </div>
    </li>
  );
}

export default function ContactedPropertiesTable({ items }: { items: ContactedProperty[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <div className={CONTACTED_TABLE_MIN_WIDTH_CLASS}>
        <div
          className={`border-b border-slate-200 bg-slate-50 px-5 py-3.5 text-[12px] font-bold uppercase text-slate-500 ${CONTACTED_GRID_CLASS}`}
          aria-hidden
        >
          {CONTACTED_TABLE_COLUMNS.map((column) => (
            <span key={column}>{column}</span>
          ))}
        </div>
        <ul>
          {items.map((item) => (
            <ContactedPropertyRow key={item.id} item={item} />
          ))}
        </ul>
      </div>
    </div>
  );
}
