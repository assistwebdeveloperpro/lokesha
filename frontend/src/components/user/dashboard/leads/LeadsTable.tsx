"use client";

import { Hash, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatSearchListingArea } from "@/components/landing/property-search/property-list/formatSearchListingArea";
import PropertyListPrice from "@/components/user/dashboard/manage-properties/PropertyListPrice";
import { formatTimeAgo } from "@/components/user/dashboard/notifications/formatTimeAgo";
import PropertyThumbnail from "@/components/user/dashboard/shared/PropertyThumbnail";
import {
  CONTACT_ROLE_LABEL,
  formatActivityDateTime,
  getListingTypeLabel,
  getPropertyLocation,
  getViewPropertyHref,
  humanizeSlug,
  isSearchListing,
} from "@/components/user/dashboard/shared/propertyActivityShared";
import type { UserLead } from "@/services/userLeads.service";
import {
  getPhoneStatusLabel,
  HIGHLIGHT_ROW_CLASS,
  LEADS_GRID_CLASS,
  LEADS_TABLE_COLUMNS,
  LEADS_TABLE_MIN_WIDTH_CLASS,
} from "./leadsShared";

const chipClassName =
  "inline-flex w-fit items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200/70";

const iconBubbleClassName = (tone: string) =>
  `flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${tone}`;

const ACTION_BASE_CLASS =
  "inline-flex min-h-9 items-center justify-center rounded-xl px-3 md:px-4 text-xs font-semibold transition";

function LeadRow({ item, isHighlighted }: { item: UserLead; isHighlighted: boolean }) {
  const rowRef = useRef<HTMLLIElement>(null);
  const { property, enquirer } = item;

  useEffect(() => {
    if (isHighlighted) rowRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [isHighlighted]);

  const listing = isSearchListing(property) ? property : null;
  const typeLabel = humanizeSlug(listing?.propertySubType ?? property.propertyType);
  const bedrooms = listing?.bedrooms.length ? `${listing.bedrooms.join("-")} BHK` : null;

  return (
    <li
      ref={rowRef}
      className={`grid gap-4 border-b border-slate-100 px-5 py-4 transition last:border-b-0 ${
        isHighlighted ? HIGHLIGHT_ROW_CLASS : "hover:bg-slate-50"
      } ${LEADS_GRID_CLASS}`}
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

      <div className="min-w-0 space-y-1.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-slate-900">{enquirer.name}</p>
          {item.isNew ? (
            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200">
              New
            </span>
          ) : null}
        </div>
        {enquirer.mobile ? (
          <p className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span className={iconBubbleClassName("bg-emerald-50 text-emerald-600")}>
              <Phone className="h-3 w-3" aria-hidden />
            </span>
            {enquirer.mobile}
          </p>
        ) : null}
        {enquirer.email ? (
          <p className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span className={iconBubbleClassName("bg-sky-50 text-sky-600")}>
              <Mail className="h-3 w-3" aria-hidden />
            </span>
            <span className="truncate" title={enquirer.email}>
              {enquirer.email}
            </span>
          </p>
        ) : null}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">{formatTimeAgo(item.enquiryDate)}</p>
        <p className="mt-0.5 text-xs text-slate-500">{formatActivityDateTime(item.enquiryDate)}</p>
      </div>

      <div className="min-w-0">
        <span className="inline-flex w-fit rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 ring-1 ring-sky-200">
          {CONTACT_ROLE_LABEL[item.contactRole]}
        </span>
        <p className={`mt-1.5 text-xs font-medium ${item.phoneRevealed ? "text-emerald-600" : "text-slate-500"}`}>
          {getPhoneStatusLabel(item.phoneRevealed)}
        </p>
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
            Unavailable
          </button>
        )}
      </div>
    </li>
  );
}

type LeadsTableProps = {
  items: UserLead[];
  highlightLeadId: string | null;
};

export default function LeadsTable({ items, highlightLeadId }: LeadsTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/90 scrollbar-hidden bg-white shadow-sm">
      <div className={LEADS_TABLE_MIN_WIDTH_CLASS}>
        <div
          className={`border-b border-slate-200 bg-slate-50 px-5 py-3.5 text-[12px] scrollbar-hidden font-bold uppercase text-slate-500 ${LEADS_GRID_CLASS}`}
          aria-hidden
        >
          {LEADS_TABLE_COLUMNS.map((column) => (
            <span key={column}>{column}</span>
          ))}
        </div>
        <ul>
          {items.map((item) => (
            <LeadRow key={item.id} item={item} isHighlighted={item.id === highlightLeadId} />
          ))}
        </ul>
      </div>
    </div>
  );
}
