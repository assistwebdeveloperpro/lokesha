"use client";

import { X } from "lucide-react";
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
import { toDisplayEntries } from "./reviewPropertiesShared";

type DetailOwner = { name: string; mobile: string };

type LoadResult = { id: string; detail: PropertyDetailResponse | null; error: string };

const LOAD_ERROR = "Unable to load this property. Please try again.";

function Section({ title, entries }: { title: string; entries: { label: string; value: string }[] }) {
  if (entries.length === 0) return null;

  return (
    <section className="mt-5">
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h3>
      <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
        {entries.map(({ label, value }) => (
          <div key={label} className="flex justify-between gap-3 border-b border-slate-100 py-1 text-sm">
            <dt className="text-slate-500">{label}</dt>
            <dd className="text-right font-medium text-slate-800">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

const getListingImages = (detail: PropertyDetailResponse, index: number) =>
  (detail.listingFiles?.[index]?.media ?? detail.media).filter((item) => item.mediaType === "image");

const getSubTypeLabel = (propertyType: string, slug: string) =>
  SUB_TYPES_BY_PROPERTY_TYPE[propertyType as PropertyTypeId]?.find((option) => option.id === slug)?.label ?? slug;

// Steps 2 to 5 of one sub type: its photos, details, pricing, amenities and unit charges
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
    <div className={showHeading ? "mt-6 rounded-xl border border-slate-200 p-4" : ""}>
      {showHeading ? (
        <h3 className="text-base font-bold text-navy-blue">{getSubTypeLabel(propertyType, listing.propertySubType)}</h3>
      ) : null}

      {images.length > 0 ? (
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((image) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={image.id}
              src={getAssetUrl(image.path)}
              alt={image.category}
              loading="lazy"
              className="aspect-square w-full rounded-lg border border-slate-200 object-cover"
            />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-500">No photos uploaded.</p>
      )}

      <Section title="Details" entries={toDisplayEntries(listing.details)} />
      <Section title="Plot" entries={toDisplayEntries(listing.plotDetails)} />
      <Section title="Pricing" entries={toDisplayEntries(listing.pricing)} />
      <Section
        title="Amenities"
        entries={toDisplayEntries({ amenities: listing.amenities?.amenities, furnishing: listing.amenities?.furnishing })}
      />
      {(listing.variants ?? []).map((variant, index) => (
        <Section
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
    </div>
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close details"
        className="absolute inset-0 cursor-pointer bg-slate-900/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-detail-heading"
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        {!current ? (
          <div className="animate-pulse space-y-3" aria-busy="true">
            <div className="h-6 w-1/2 rounded bg-slate-200" />
            <div className="h-40 rounded bg-slate-100" />
          </div>
        ) : !detail || !listing ? (
          <p className="py-10 text-center text-sm text-red-600" role="alert">
            {current.error}
          </p>
        ) : (
          <>
            <h2 id="review-detail-heading" className="pr-8 text-lg font-bold text-slate-900">
              {detail.property.title}
            </h2>
            {owner ? (
              <p className="mt-1 text-sm text-slate-500">
                {owner.name} · {owner.mobile}
              </p>
            ) : null}

            {detail.property.rejectionReason ? (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                Rejected: {detail.property.rejectionReason}
              </p>
            ) : null}

            {listing.description ? <p className="mt-4 text-sm text-slate-700">{listing.description}</p> : null}

            <Section title="Address" entries={toDisplayEntries(detail.payload.address)} />

            {detail.payload.listings.map((item, index) => (
              <SubTypeBlock
                key={item.propertySubType}
                propertyType={detail.payload.propertyType}
                listing={item}
                images={getListingImages(detail, index)}
                showHeading={detail.payload.listings.length > 1}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
