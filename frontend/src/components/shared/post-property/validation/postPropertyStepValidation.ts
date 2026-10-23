import type { BuilderFieldErrors } from "../builder/builderValidation";
import {
  hasAddressLocationErrors,
  hasAmenitiesErrors,
  hasPricingOthersErrors,
  hasPropertyDetailsErrors,
  type AddressLocationFieldErrors,
  type AmenitiesFieldErrors,
  type PricingOthersFieldErrors,
  type PropertyDetailsFieldErrors,
} from "../config/postPropertyForm.shared";

export type TabStepErrors = {
  details: boolean;
  amenities: boolean;
  photos: boolean;
  pricing: boolean;
};

type StepErrors = {
  address: AddressLocationFieldErrors;
  details: PropertyDetailsFieldErrors;
  amenities: AmenitiesFieldErrors;
  pricing: PricingOthersFieldErrors;
  photos: string;
  builder: BuilderFieldErrors;
  // Set only when several sub types are selected
  tabs: TabStepErrors | null;
};

// Step number of the earliest step that still has an error, or null when all pass
export function resolveFirstInvalidStep({
  address,
  details,
  amenities,
  pricing,
  photos,
  builder,
  tabs,
}: StepErrors): number | null {
  if (hasAddressLocationErrors(address)) {
    return 1;
  }
  if (hasPropertyDetailsErrors(details) || tabs?.details || builder.projectType) {
    return 2;
  }
  if (hasAmenitiesErrors(amenities) || tabs?.amenities) {
    return 3;
  }
  if (photos || tabs?.photos) {
    return 4;
  }
  if (hasPricingOthersErrors(pricing) || tabs?.pricing || builder.assuredReturn) {
    return 5;
  }

  return null;
}
