"use client";

import { Building2, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getAdminToken } from "@/services/adminSession";
import { ApiError, getAssetUrl } from "@/services/apiClient";
import {
  SUB_TYPES_BY_PROPERTY_TYPE,
  type PropertyTypeId,
} from "@/components/shared/post-property/config/postPropertyForm.shared";
import {
  getPropertyById,
  type PropertyDetailResponse,
  type PropertyListingPayload,
  type PropertyMediaFileDto,
} from "@/services/property.service";
import {
  getMainPhotoImage,
  getSubTypeListingImages,
  getSupplementalProjectImages,
  toDisplayEntries,
} from "./reviewPropertiesShared";

type DetailOwner = { name: string; mobile: string };

type LoadResult = { id: string; detail: PropertyDetailResponse | null; error: string };

const LOAD_ERROR = "Unable to load this property. Please try again.";

const sectionTitleClassName = "font-bold text-slate-700";
const sectionTitleCompactClassName = "font-bold text-slate-700";

function DetailSection({
  title,
  entries,
  layout = "twoColumn",
}: {
  title?: string;
  entries: { label: string; value: string }[];
  layout?: "twoColumn" | "fullRow";
}) {
  if (entries.length === 0) return null;

  const isFullRow = layout === "fullRow";

  return (
    <section className={title ? "mt-5 first:mt-0" : ""}>
      {title ? (
        <h3 className={sectionTitleClassName}>{title}</h3>
      ) : null}
      <dl
        className={`grid grid-cols-1 gap-y-1.5 ${isFullRow ? "" : "gap-x-6 sm:grid-cols-2"} ${title ? "mt-2" : ""}`}
      >
        {entries.map(({ label, value }) => (
          <div
            key={label}
            className={
              isFullRow
                ? "border-b border-slate-100 py-2 text-sm"
                : "flex justify-between gap-3 border-b border-slate-100 py-1 text-sm"
            }
          >
            <dt className="text-slate-500">{label}</dt>
            <dd
              className={
                isFullRow
                  ? "mt-1 font-medium leading-relaxed text-slate-800"
                  : "text-right font-medium text-slate-800"
              }
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function PhotoGrid({ images, className = "" }: { images: PropertyMediaFileDto[]; className?: string }) {
  if (images.length === 0) return null;

  return (
    <div className={`grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 ${className}`}>
      {images.map((image) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={image.id}
          src={getAssetUrl(image.path)}
          alt={image.category.replace(/-/g, " ")}
          loading="lazy"
          className="aspect-[4/3] w-full rounded-xl border border-slate-200/90 object-cover shadow-sm"
        />
      ))}
    </div>
  );
}

const getSubTypeLabel = (propertyType: string, slug: string) =>
  SUB_TYPES_BY_PROPERTY_TYPE[propertyType as PropertyTypeId]?.find((option) => option.id === slug)?.label ?? slug;

function SubTypeBlock({
  propertyType,
  listing,
  images,
  showHeading,
}: {
  propertyType: string;
  listing: PropertyListingPayload;
  images: PropertyMediaFileDto[];
  showHeading: boolean;
}) {
  return (
    <article className={showHeading ? "space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" : "space-y-4"}>
      {showHeading ? (
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-navy-blue/10 text-navy-blue">
            <Building2 className="h-4 w-4" aria-hidden />
          </span>
          <h3 className="font-display text-base font-bold text-slate-800">
            {getSubTypeLabel(propertyType, listing.propertySubType)}
          </h3>
        </div>
      ) : null}

      <div>
        <h4 className={sectionTitleCompactClassName}>Photos</h4>
        {images.length > 0 ? (
          <PhotoGrid images={images} className="mt-3" />
        ) : (
          <p className="mt-2 text-sm text-slate-500">No photos for this sub type.</p>
        )}
      </div>

      <DetailSection title="Details" entries={toDisplayEntries(listing.details)} />
      <DetailSection title="Plot" entries={toDisplayEntries(listing.plotDetails)} />
      <DetailSection title="Pricing" entries={toDisplayEntries(listing.pricing)} />
      <DetailSection
        title="Amenities"
        layout="fullRow"
        entries={toDisplayEntries({
          amenities: listing.amenities?.amenities,
          furnishing: listing.amenities?.furnishing,
        })}
      />
      {(listing.variants ?? []).map((variant, index) => (
        <DetailSection
          key={`${variant.label ?? "unit"}-${index}`}
          title={`Unit - ${variant.label ?? index + 1}`}
          entries={toDisplayEntries({
            size: variant.size,
            sizeUnit: variant.sizeUnit,
            price: variant.price,
            unitsAvailable: variant.unitsAvailable,
            ...variant.charges,
          })}
        />
      ))}
    </article>
  );
}

type ReviewDetailModalProps = { propertyId: string; owner?: DetailOwner; onClose: () => void };

export default function ReviewDetailModal({ propertyId, owner, onClose }: ReviewDetailModalProps) {
  const [result, setResult] = useState<LoadResult | null>(null);

  useEffect(() => {
    const token = getAdminToken();
    let cancelled = false;

    const request = token ? getPropertyById(propertyId, token, "admin") : Promise.reject(new ApiError(LOAD_ERROR, 401));
    request
      .then((detail) => !cancelled && setResult({ id: propertyId, detail, error: "" }))
      .catch(() => !cancelled && setResult({ id: propertyId, detail: null, error: LOAD_ERROR }));

    return () => {
      cancelled = true;
    };
  }, [propertyId]);

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

  const current = result?.id === propertyId ? result : null;
  const detail = current?.detail ?? null;
  const listing = detail?.payload.listings[0];
  const isMultiSubType = (detail?.payload.listings.length ?? 0) > 1;
  const mainPhoto = detail ? getMainPhotoImage(detail, isMultiSubType) : null;
  const supplementalProjectImages = detail
    ? getSupplementalProjectImages(detail, isMultiSubType, mainPhoto)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close details"
        className="absolute inset-0 cursor-pointer bg-slate-900/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-detail-heading"
        className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-slate-200/90 bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"
      >
        <div className="sticky top-0 z-10 flex shrink-0 items-start justify-between gap-4 border-b border-slate-200/90 bg-white/95 px-5 py-4 backdrop-blur-sm sm:px-6">
          <div className="min-w-0 pr-2">
            {!current || !detail || !listing ? (
              <div className="h-6 w-48 animate-pulse rounded bg-slate-200" aria-hidden />
            ) : (
              <>
                <h2 id="review-detail-heading" className="font-display truncate text-lg font-bold text-slate-900 sm:text-xl">
                  {detail.property.title}
                </h2>
                {owner ? (
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <UserRound className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {owner.name}
                    </span>
                    <span className="hidden text-slate-300 sm:inline" aria-hidden>
                      ·
                    </span>
                    <span>{owner.mobile}</span>
                  </p>
                ) : null}
              </>
            )}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {!current ? (
            <div className="animate-pulse space-y-4" aria-busy="true">
              <div className="aspect-[4/3] w-full max-w-[220px] rounded-lg bg-slate-100 sm:max-w-[260px]" />
              <div className="h-4 w-full rounded bg-slate-100" />
              <div className="h-4 w-2/3 rounded bg-slate-100" />
            </div>
          ) : !detail || !listing ? (
            <p className="py-16 text-center text-sm text-red-600" role="alert">
              {current.error}
            </p>
          ) : (
            <div className="space-y-6">
              {detail.property.rejectionReason ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  <span className="font-semibold">Rejected:</span> {detail.property.rejectionReason}
                </p>
              ) : null}

              {listing.description ? (
                <section>
                  <h3 className={sectionTitleCompactClassName}>Description</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{listing.description}</p>
                </section>
              ) : null}

              {mainPhoto ? (
                <section>
                  <h3 className={sectionTitleClassName}>Main photo</h3>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getAssetUrl(mainPhoto.path)}
                    alt="Main property photo"
                    className="mt-2 aspect-[4/3] w-full max-w-[220px] rounded-lg border border-slate-200 object-cover sm:max-w-[260px]"
                  />
                </section>
              ) : null}

              {supplementalProjectImages.length > 0 ? (
                <section>
                  <h3 className={sectionTitleCompactClassName}>Project photos</h3>
                  <PhotoGrid images={supplementalProjectImages} className="mt-3" />
                </section>
              ) : null}

              <DetailSection title="Address" entries={toDisplayEntries(detail.payload.address)} />

              {isMultiSubType ? (
                <div className="space-y-4">
                  <h3 className={`font-display ${sectionTitleClassName}`}>Sub types</h3>
                  {detail.payload.listings.map((item, index) => (
                    <SubTypeBlock
                      key={`${item.propertySubType}-${item.propertyId ?? index}`}
                      propertyType={detail.payload.propertyType}
                      listing={item}
                      images={getSubTypeListingImages(detail, index, isMultiSubType)}
                      showHeading
                    />
                  ))}
                </div>
              ) : (
                <SubTypeBlock
                  propertyType={detail.payload.propertyType}
                  listing={listing}
                  images={getSubTypeListingImages(detail, 0, false)}
                  showHeading={false}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
