"use client";

import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Hash,
  ImageOff,
  LayoutGrid,
  ListChecks,
  Mail,
  MapPin,
  Phone,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
  formatPostedDate,
} from "@/components/user/dashboard/manage-properties/managePropertiesShared";
import { getAssetUrl } from "@/services/apiClient";
import type { AdminLead } from "@/services/adminLeads.service";
import type { ReviewDetailResponse } from "@/services/propertyReview.service";
import LeadPropertyDrawerSkeleton from "./LeadPropertyDrawerSkeleton";
import {
  getAddressLines,
  getImages,
  getListerContacts,
  getListingFacts,
  getListingPrice,
  getVariantRows,
  humanize,
} from "./leadPropertyShared";
import { getInitials, getPropertyDetailsHref, LISTED_BY_LABEL } from "./leadsShared";
import { useLeadProperty } from "./useLeadProperty";

const sectionClassName = "rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5";

const HEADING_TONES = {
  sky: "bg-sky-100 text-sky-700 ring-sky-200",
  rose: "bg-rose-100 text-rose-600 ring-rose-200",
  violet: "bg-violet-100 text-violet-700 ring-violet-200",
  indigo: "bg-indigo-100 text-indigo-700 ring-indigo-200",
  amber: "bg-amber-100 text-amber-700 ring-amber-200",
} as const;

function SectionHeading({
  icon: Icon,
  tone,
  children,
}: {
  icon: LucideIcon;
  tone: keyof typeof HEADING_TONES;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${HEADING_TONES[tone]}`}>
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <h3 className="font-display text-sm font-bold tracking-tight text-navy-deep sm:text-base">{children}</h3>
      <span className="h-px flex-1 bg-linear-to-r from-slate-200 to-transparent" aria-hidden />
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm">
      <p className="truncate text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1.5 truncate text-sm font-bold text-slate-900 sm:text-base" title={value}>
        {value}
      </p>
    </div>
  );
}

const CONTACT_ICONS = {
  mobile: { Icon: Phone, className: "bg-emerald-100 text-emerald-600" },
  email: { Icon: Mail, className: "bg-sky-100 text-sky-600" },
} as const;

const hiddenScrollbarClassName = "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

const arrowClassName =
  "absolute top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md ring-1 ring-slate-200 transition hover:bg-white hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500";

function ImageSlider({ media, title }: Pick<ReviewDetailResponse, "media"> & { title: string }) {
  const images = getImages(media);
  const [activeIndex, setActiveIndex] = useState(0);
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const thumbRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const active = images[activeIndex];
  const hasMany = images.length > 1;

  useEffect(() => {
    thumbRefs.current[activeIndex]?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [activeIndex]);

  const go = (step: number) => setActiveIndex((current) => (current + step + images.length) % images.length);
  const markFailed = (id: string) => setFailed((current) => new Set(current).add(id));

  return (
    <div className="space-y-2.5">
      <div className="relative aspect-16/9 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200/90">
        {active && !failed.has(active.id) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={active.id}
            src={getAssetUrl(active.path)}
            alt={`${title} photo ${activeIndex + 1}`}
            onError={() => markFailed(active.id)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
            <ImageOff className="h-9 w-9" aria-hidden />
            <span className="text-xs font-medium">{active ? "Photo could not be loaded" : "No photos uploaded"}</span>
          </div>
        )}

        {hasMany ? (
          <>
            <button type="button" aria-label="Previous photo" onClick={() => go(-1)} className={`${arrowClassName} left-3`}>
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button type="button" aria-label="Next photo" onClick={() => go(1)} className={`${arrowClassName} right-3`}>
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-slate-900/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              {activeIndex + 1} / {images.length}
            </span>
          </>
        ) : null}
      </div>

      {hasMany ? (
        <ul className={`flex gap-2 overflow-x-auto overflow-y-hidden p-1 ${hiddenScrollbarClassName}`}>
          {images.map((image, index) => (
            <li key={image.id} className="shrink-0">
              <button
                type="button"
                ref={(node) => {
                  thumbRefs.current[index] = node;
                }}
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === activeIndex}
                onClick={() => setActiveIndex(index)}
                className={`block h-14 w-20 cursor-pointer overflow-hidden rounded-xl bg-slate-100 transition ${
                  index === activeIndex ? "ring-2 ring-sky-500 ring-offset-1" : "opacity-70 ring-1 ring-slate-200 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getAssetUrl(image.path)} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

type ListingCardProps = {
  listing: ReviewDetailResponse["payload"]["listings"][number];
  fallbackPrice: number | null;
  index: number;
  total: number;
};

function ListingCard({ listing, fallbackPrice, index, total }: ListingCardProps) {
  const price = getListingPrice(listing, fallbackPrice);
  const facts = getListingFacts(listing);
  const variants = getVariantRows(listing);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-sky-50/90 px-4 py-3 sm:px-5">
        <SectionHeading icon={ListChecks} tone="amber">
          {humanize(listing.propertySubType)} details
          {total > 1 ? <span className="ml-2 text-xs font-semibold text-slate-400">{index + 1} of {total}</span> : null}
        </SectionHeading>
        {price ? (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
            {price.value}
          </span>
        ) : null}
      </div>

      <div className="p-4 sm:p-5">
        {facts.length ? (
          <dl className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-6">
            {facts.map((fact) => (
              <div key={fact.label} className="border-b border-slate-100 py-3">
                <dt className="text-xs font-medium text-slate-500">{fact.label}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-900">{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm font-medium text-slate-500">No extra details were added.</p>
        )}

        {variants.length ? (
          <div className="mt-5 border-t border-slate-100 pt-5">
            <SectionHeading icon={LayoutGrid} tone="violet">
              Unit types
            </SectionHeading>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {variants.map((variant) => (
                <li
                  key={variant.id}
                  className="relative overflow-hidden rounded-xl border border-violet-100 bg-linear-to-br from-violet-50/80 to-white p-3.5 shadow-sm"
                >
                  <span className="absolute inset-y-0 left-0 w-1 bg-violet-400" aria-hidden />
                  <p className="truncate pl-1 text-sm font-bold text-slate-900" title={variant.name}>
                    {variant.name}
                  </p>
                  <p className="mt-0.5 pl-1 text-xs font-medium text-slate-500">{variant.area ?? "Area not added"}</p>
                  <p className="mt-2.5 pl-1 text-base font-bold text-violet-700">{variant.price ?? "Price on request"}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function PropertyBody({ detail, lead }: { detail: ReviewDetailResponse; lead: AdminLead }) {
  const { property, payload, owner, media } = detail;
  const { street, region } = getAddressLines(payload.address);
  const contacts = getListerContacts(lead.lister.listedBy, owner, payload.ownerContact);
  const isRent = payload.listingType === "rent-lease";
  const startingPrice = payload.listings.map((listing) => getListingPrice(listing, property.price)).find(Boolean);
  const descriptions = payload.listings.flatMap((listing, index) =>
    listing.description?.trim()
      ? [{ key: listing.propertyId ?? String(index), subType: humanize(listing.propertySubType), text: listing.description.trim() }]
      : [],
  );

  return (
    <div className="space-y-5">
      <ImageSlider media={media} title={property.title} />

      {descriptions.length ? (
        <section className={sectionClassName}>
          <SectionHeading icon={FileText} tone="sky">
            Description
          </SectionHeading>
          <div className="mt-3 space-y-3">
            {descriptions.map(({ key, subType, text }) => (
              <div key={key}>
                {descriptions.length > 1 ? (
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">{subType}</p>
                ) : null}
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid grid-cols-3 gap-3">
        <StatTile label={isRent ? "Rent" : "Price"} value={startingPrice?.value ?? "—"} />
        <StatTile label="Type" value={humanize(payload.propertyType)} />
        <StatTile label="Posted" value={formatPostedDate(property.createdAt)} />
      </div>

      <section className={sectionClassName}>
        <SectionHeading icon={MapPin} tone="rose">
          Location
        </SectionHeading>
        <p className="mt-3 text-sm font-semibold text-slate-900">{street || "—"}</p>
        {region ? <p className="mt-1 text-xs font-medium text-slate-500">{region}</p> : null}
      </section>

      {payload.listings.map((listing, index) => (
        <ListingCard
          key={listing.propertyId ?? index}
          listing={listing}
          fallbackPrice={listing.propertyId === property.id ? property.price : null}
          index={index}
          total={payload.listings.length}
        />
      ))}

      <section className={`${sectionClassName} mb-2`}>
        <SectionHeading icon={User} tone="indigo">
          Listed by
        </SectionHeading>

        <div className="mt-4 flex items-center gap-4">
          <span className="bg-linear-to-r-navy-blue flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-md ring-2 ring-white">
            {getInitials(owner.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-slate-900">{owner.name}</p>
            {lead.lister.listedBy ? (
              <span className="mt-1.5 inline-flex rounded-md bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 ring-1 ring-indigo-100">
                {LISTED_BY_LABEL[lead.lister.listedBy] ?? lead.lister.listedBy}
              </span>
            ) : null}
          </div>
        </div>

        <ul className="mt-5 space-y-3">
          {contacts.map(({ key, label, value }) => {
            const { Icon, className } = CONTACT_ICONS[key];
            return (
              <li key={key} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-3 ring-1 ring-slate-200/70">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${className}`}>
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="truncate text-sm font-semibold text-slate-800" title={value}>
                    {value}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

type LeadPropertyDrawerProps = {
  lead: AdminLead;
  onClose: () => void;
};

export default function LeadPropertyDrawer({ lead, onClose }: LeadPropertyDrawerProps) {
  const { property } = lead;
  const { detail, isLoading, error, reload } = useLeadProperty(property.id);
  const status = detail?.property.status;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close property details"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-slate-900/40 backdrop-blur-[2px]"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-property-heading"
        className="relative flex h-full w-full max-w-xl flex-col bg-slate-50 shadow-2xl"
      >
        <header className="bg-linear-to-r-navy-blue flex items-start justify-between gap-4 px-5 py-4 text-white sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/25">
              <Building2 className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 id="lead-property-heading" className="font-display truncate text-lg font-bold">
                {property.title}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-0.5 rounded-md bg-white/15 px-1.5 py-0.5 font-mono text-[11px] font-semibold">
                  <Hash className="h-3 w-3" aria-hidden />
                  {property.listingNumber}
                </span>
                {status ? (
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_BADGE_CLASSES[status]}`}>
                    {STATUS_LABELS[status]}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6" aria-live="polite">
          {isLoading ? (
            <LeadPropertyDrawerSkeleton />
          ) : error || !detail ? (
            <div className="flex flex-col items-center rounded-2xl border border-slate-200/90 bg-white px-6 py-14 text-center shadow-sm">
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
              <button
                type="button"
                onClick={reload}
                className="bg-linear-to-r-navy-blue mt-5 min-h-10 cursor-pointer rounded-xl px-6 text-sm font-semibold text-white shadow-md"
              >
                Try again
              </button>
            </div>
          ) : (
            <PropertyBody detail={detail} lead={lead} />
          )}
        </div>

        <footer className="border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
          <Link
            href={getPropertyDetailsHref(property.id, property.title)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-linear-to-r-navy-blue inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            Open public listing
          </Link>
        </footer>
      </aside>
    </div>
  );
}
