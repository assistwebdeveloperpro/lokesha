import type { DraftSummary } from "@/services/property.service";
import {
  FORM_STEPS,
  LISTING_TYPES,
  PROPERTY_TYPES,
  SUB_TYPES_BY_PROPERTY_TYPE,
  type PropertyTypeId,
} from "../config/postPropertyForm.shared";

const UNTITLED_DRAFT = "Untitled draft";

// "Residential · Flat/Apartment, Duplex"
export function getDraftTitle(draft: Pick<DraftSummary, "summary">): string {
  const summary = draft.summary;
  if (!summary?.propertyType) {
    return UNTITLED_DRAFT;
  }

  const propertyType = summary.propertyType as PropertyTypeId;
  const propertyLabel = PROPERTY_TYPES.find((option) => option.id === propertyType)?.label;
  const subTypeLabels = (summary.subTypes ?? []).flatMap(
    (id) => SUB_TYPES_BY_PROPERTY_TYPE[propertyType]?.find((option) => option.id === id)?.label ?? [],
  );

  return [propertyLabel, subTypeLabels.join(", ")].filter(Boolean).join(" · ") || UNTITLED_DRAFT;
}

// "For Sale · Vesu"
export function getDraftSubtitle(draft: Pick<DraftSummary, "summary">): string {
  const summary = draft.summary;
  const listingLabel = LISTING_TYPES.find((option) => option.id === summary?.listingType)?.label;

  return [listingLabel, summary?.locality].filter(Boolean).join(" · ");
}

export function getResumeHref(
  draft: Pick<DraftSummary, "id" | "currentStep">,
  basePath = "/post-property",
): string {
  const step = Math.min(Math.max(draft.currentStep, 1), FORM_STEPS.length);
  const params = new URLSearchParams({ draft: draft.id });
  if (step > 1) params.set("step", String(step));

  return `${basePath}?${params.toString()}`;
}
