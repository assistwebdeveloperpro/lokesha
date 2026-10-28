"use client";

import {
  Archive,
  Building2,
  CalendarDays,
  CircleCheck,
  Eye,
  Hash,
  Pencil,
  Phone,
  RotateCcw,
  Trash2,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ListingModalAction } from "@/components/user/dashboard/manage-properties/ListingActionModal";
import PropertyListPrice from "@/components/user/dashboard/manage-properties/PropertyListPrice";
import {
  STATUS_ACTION_LABELS,
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
  formatPostedDate,
  getHeading,
  getListingLabel,
  getStatusAction,
  getSubtitle,
} from "@/components/user/dashboard/manage-properties/managePropertiesShared";
import type { ManageListItem } from "@/services/adminManageProperties.service";
import { getAssetUrl } from "@/services/apiClient";

const EDIT_PATH = "/backend/properties/post-property";

const actionButtonClassName =
  "inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const listingActionButtonClassName =
  "inline-flex min-h-11 w-full basis-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const ROLE_LABELS: Record<string, string> = {
  buyer_owner_tenant: "Buyer",
  agent: "Agent",
  builder: "Builder",
  lokesha_staff: "Lokesha Staff",
  admin: "Admin",
};

function formatListedByRole(role: string) {
  return ROLE_LABELS[role] ?? role.replaceAll("_", " ");
}

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

type ManagePropertyCardProps = {
  property: ManageListItem;
  isBusy: boolean;
  isHighlighted?: boolean;
  showSourceBadge?: boolean;
  showOwnerDetails?: boolean;
  allowListingActions?: boolean;
  onView: (property: ManageListItem) => void;
  onPublish: (property: ManageListItem) => void;
  onDelete: (property: ManageListItem) => void;
  onListingAction: (property: ManageListItem, action: ListingModalAction) => void;
};

export default function ManagePropertyCard({
  property,
  isBusy,
  isHighlighted = false,
  showSourceBadge = true,
  showOwnerDetails = true,
  allowListingActions = true,
  onView,
  onPublish,
  onDelete,
  onListingAction,
}: ManagePropertyCardProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const showImage = property.mainImage && !hasImageError;
  // Admins edit any listing but only publish and close the ones created by admins
  const isAdminListing = property.listedBy.source === "admin";
  const listedByRole = formatListedByRole(property.listedBy.role);
  const canChangeListing = isAdminListing && allowListingActions;
  const canPublish = canChangeListing && property.status === "draft";
  const statusAction = canChangeListing ? getStatusAction(property.status) : null;
  const listingAction = statusAction === "close" || statusAction === "reopen" ? statusAction : null;

  useEffect(() => {
    if (isHighlighted) cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [isHighlighted]);

  return (
    <article
      ref={cardRef}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,.08),0_4px_12px_rgba(15,23,42,.04)] transition hover:-translate-y-0.5 hover:border-slate-300/90 hover:shadow-lg ${
        isBusy ? "opacity-60" : ""
      } ${isHighlighted ? "property-card-highlight" : ""}`}
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
        <PropertyListPrice item={property} />
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50/80">
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
            <span
              className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-sm font-bold tabular-nums text-navy-blue shadow-sm ring-1 ring-slate-200/80"
              aria-label={`Listing ID ${property.listingNumber}`}
            >
              <Hash className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
              <span className="truncate">{property.listingNumber}</span>
            </span>
            {showSourceBadge ? (
              <span
                className={`max-w-full rounded-full px-2.5 py-1 text-xs font-semibold leading-snug wrap-break-word ${
                  isAdminListing
                    ? "bg-sky-100 text-navy-blue"
                    : "bg-white text-slate-600 ring-1 ring-slate-200/90"
                }`}
              >
                {listedByRole}
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
            {showOwnerDetails && property.owner.mobile ? (
              <p className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700">
                <Phone className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                {property.owner.mobile}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {showOwnerDetails ? (
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
          ) : null}
          <Link
            href={`${EDIT_PATH}?edit=${property.id}`}
            aria-label={`Edit ${property.title}`}
            aria-disabled={isBusy}
            className={`${actionButtonClassName} border-sky-300 text-sky-600 hover:bg-sky-50 focus-visible:outline-sky-500`}
          >
            <Pencil className="h-4 w-4" aria-hidden />
            Edit
          </Link>
          {canChangeListing ? (
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
          ) : null}
          {canPublish ? (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onPublish(property)}
              className={`${actionButtonClassName} basis-full border-emerald-300 text-emerald-600 hover:bg-emerald-50 focus-visible:outline-emerald-500`}
            >
              <CircleCheck className="h-4 w-4" aria-hidden />
              Publish
            </button>
          ) : null}
          {listingAction ? (
            <button
              type="button"
              disabled={isBusy}
              aria-label={`${STATUS_ACTION_LABELS[listingAction]} ${property.title}`}
              onClick={() => onListingAction(property, listingAction)}
              className={`${listingActionButtonClassName} ${LISTING_ACTION_STYLES[listingAction].button}`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ${LISTING_ACTION_STYLES[listingAction].icon}`}
              >
                {listingAction === "close" ? (
                  <Archive className="h-4 w-4" aria-hidden />
                ) : (
                  <RotateCcw className="h-4 w-4" aria-hidden />
                )}
              </span>
              {STATUS_ACTION_LABELS[listingAction]}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
