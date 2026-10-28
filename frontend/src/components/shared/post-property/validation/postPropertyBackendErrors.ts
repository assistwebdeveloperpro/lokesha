import type {
  AddressLocationFieldErrors,
  AmenitiesFieldErrors,
  PricingOthersFieldErrors,
  PropertyDetailsFieldErrors,
} from "../config/postPropertyForm.shared";

type Section = "address" | "details" | "amenities" | "pricing" | "photos";

type Target = { step: number; section?: Section; field?: string };

export type BackendFormErrors = {
  // Earliest step with a problem, or null when no field could be placed
  step: number | null;
  firstMessage: string;
  addressLocationErrors: AddressLocationFieldErrors;
  propertyDetailsErrors: PropertyDetailsFieldErrors;
  amenitiesErrors: AmenitiesFieldErrors;
  pricingOthersErrors: PricingOthersFieldErrors;
  photosError: string;
};

const STEP_BASIC = 1;
const STEP_DETAILS = 2;
const STEP_AMENITIES = 3;
const STEP_PHOTOS = 4;
const STEP_PRICING = 5;

const ADDRESS_FIELDS = ["projectName", "locality", "pinCode"];

// Backend detail fields that belong to the amenities step, with the form field they show on
const AMENITY_STEP_DETAILS: Record<string, string | undefined> = {
  furnishingStatus: "status",
  washrooms: "washrooms",
  carParkingCount: "carParking",
  roadFacing: undefined,
  hasPantry: undefined,
  hasCafeteria: undefined,
  isCornerShop: undefined,
  clubMembership: undefined,
  openSides: undefined,
};

// Backend detail field -> form field of the property details step
const DETAIL_FIELDS: Record<string, string> = {
  bedrooms: "bedrooms",
  balconies: "balcony",
  cabins: "cabins",
  bathrooms: "bathrooms",
  totalFloors: "totalFloors",
  floorNumber: "floorNumber",
  carpetArea: "carpetAreaNumber",
  carpetAreaUnit: "carpetAreaType",
  superBuiltUpArea: "superBuildUpNumber",
  superBuiltUpAreaUnit: "superBuildUpType",
  terraceArea: "terraceAreaNumber",
  penthouseType: "penthouseType",
  ageOfConstruction: "ageOfConstruction",
  propertyTransaction: "propertyTransaction",
  isLeasedOut: "currentlyLeasedOut",
  leaseContractTill: "leaseContractTill",
  pgName: "pgName",
  pgGender: "pgGender",
};

const PLOT_FIELDS: Record<string, string> = {
  plotArea: "plotAreaNumber",
  plotAreaUnit: "plotAreaType",
  floorsAllowed: "floorsAllowed",
};

const PRICING_FIELDS: Record<string, string> = {
  expectedPrice: "expectedPrice",
  bookingAmount: "bookingAmount",
  monthlyRent: "monthlyRent",
  noticePeriodMonths: "noticePeriod",
  depositAmount: "depositAmount",
};

const SELECTION_FIELDS: Record<string, string | undefined> = {
  tenantPreference: "tenantPreferences",
  occupancy: "occupancies",
};

const PROJECT_FIELD_STEPS: Record<string, number> = {
  projectName: STEP_BASIC,
  highlights: STEP_BASIC,
  primeLocations: STEP_BASIC,
  faqs: STEP_PRICING,
  videoLink: STEP_PRICING,
  virtualTourLink: STEP_PRICING,
  paymentPlan: STEP_PRICING,
};

// "listings.0.details.bedrooms" -> { index: 0, parts: ["details", "bedrooms"] }
function splitListingPath(path: string) {
  const match = /^listings\.(\d+)\.(.+)$/.exec(path);
  return match ? { index: Number(match[1]), parts: match[2].split(".") } : null;
}

function mapListingField(parts: string[]): Target {
  const [group, field] = parts;

  switch (group) {
    case "description":
      return { step: STEP_BASIC, section: "address", field: "propertyDescription" };
    case "propertySubType":
      return { step: STEP_BASIC };
    case "facing":
      return { step: STEP_AMENITIES, section: "amenities", field: "facing" };
    case "availableFrom":
      return { step: STEP_DETAILS, section: "details", field: "availableFrom" };
    case "construction":
      return {
        step: STEP_DETAILS,
        section: "details",
        field: field === "status" ? "constructionStatus" : "possessionDate",
      };
    case "details":
      if (field in AMENITY_STEP_DETAILS) {
        const amenityField = AMENITY_STEP_DETAILS[field];
        return { step: STEP_AMENITIES, ...(amenityField && { section: "amenities" as const, field: amenityField }) };
      }
      return { step: STEP_DETAILS, section: "details", field: DETAIL_FIELDS[field] };
    case "plotDetails":
      return { step: STEP_DETAILS, section: "details", field: PLOT_FIELDS[field] };
    case "selections":
      return { step: STEP_DETAILS, section: "details", field: SELECTION_FIELDS[field] };
    case "amenities":
      return { step: STEP_AMENITIES, section: "amenities", field: field === "furnishing" ? "furnishing" : "amenities" };
    case "files":
      return { step: STEP_PHOTOS, section: "photos" };
    case "pricing":
      return { step: STEP_PRICING, section: "pricing", field: PRICING_FIELDS[field] };
    default:
      // variants and the builder block are filled in on the details step
      return { step: STEP_DETAILS };
  }
}

export function mapBackendField(path: string): { target: Target; listingIndex: number | null } {
  const listingPath = splitListingPath(path);
  if (listingPath) {
    return { target: mapListingField(listingPath.parts), listingIndex: listingPath.index };
  }

  const [root, field] = path.split(".");
  if (root === "address") {
    return {
      target: {
        step: STEP_BASIC,
        ...(ADDRESS_FIELDS.includes(field) && { section: "address" as const, field }),
      },
      listingIndex: null,
    };
  }
  if (root === "project") {
    return { target: { step: PROJECT_FIELD_STEPS[field] ?? STEP_DETAILS }, listingIndex: null };
  }

  // listingType, propertyType, listings, postingAs
  return { target: { step: STEP_BASIC }, listingIndex: null };
}

// The backend names the field with its path in quotes; people only need the problem
const toReadableMessage = (message: string) => {
  const readable = message.replace(/^"[^"]*" /, "This field ");
  return readable.charAt(0).toUpperCase() + readable.slice(1);
};

// Field errors only belong on screen when one listing is being edited; with sub type tabs only the step is used
export function resolveBackendErrors(
  fields: Record<string, string>,
  { isMulti }: { isMulti: boolean },
): BackendFormErrors {
  const result: BackendFormErrors = {
    step: null,
    firstMessage: "",
    addressLocationErrors: {},
    propertyDetailsErrors: {},
    amenitiesErrors: {},
    pricingOthersErrors: {},
    photosError: "",
  };
  const targets = {
    address: result.addressLocationErrors as Record<string, string>,
    details: result.propertyDetailsErrors as Record<string, string>,
    amenities: result.amenitiesErrors as Record<string, string>,
    pricing: result.pricingOthersErrors as Record<string, string>,
  };

  for (const [path, rawMessage] of Object.entries(fields)) {
    const { target, listingIndex } = mapBackendField(path);
    const message = toReadableMessage(rawMessage);

    if (result.step === null || target.step < result.step) {
      result.step = target.step;
      result.firstMessage = message;
    }

    if (isMulti || (listingIndex !== null && listingIndex > 0)) continue;

    if (target.section === "photos") {
      result.photosError ||= message;
    } else if (target.section && target.field) {
      targets[target.section][target.field] ??= message;
    }
  }

  return result;
}
