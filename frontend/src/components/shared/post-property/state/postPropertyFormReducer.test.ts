import { describe, expect, it } from "vitest";
import type { PropertyMedia } from "@/services/property.service";
import {
  DEFAULT_RENT_AGE_OF_CONSTRUCTION,
  RESIDENTIAL_SUB_TYPES,
  SUB_TYPES_BY_PROPERTY_TYPE,
} from "../config/postPropertyForm.shared";
import {
  createInitialDraft,
  postPropertyReducer,
  type PostPropertyAction,
  type PostPropertyDraft,
} from "./postPropertyFormReducer";
import { INITIAL_PROPERTY_DETAILS } from "./postPropertyInitialValues";

const reduce = (state: PostPropertyDraft, ...actions: PostPropertyAction[]) =>
  actions.reduce(postPropertyReducer, state);

describe("createInitialDraft", () => {
  it("starts as a residential sale listing with the first sub type", () => {
    const draft = createInitialDraft();

    expect(draft.listingType).toBe("sale");
    expect(draft.propertyType).toBe("residential");
    expect(draft.propertySubTypes).toEqual([RESIDENTIAL_SUB_TYPES[0].id]);
    expect(draft.isSubmitting).toBe(false);
  });

  it("returns an independent draft on every call", () => {
    expect(createInitialDraft()).not.toBe(createInitialDraft());
  });
});

describe("listingTypeChanged", () => {
  it("returns the same state when the listing type is unchanged", () => {
    const draft = createInitialDraft();

    expect(reduce(draft, { type: "listingTypeChanged", listingType: "sale" })).toBe(draft);
  });

  it("clears construction fields and errors and defaults the age for rent", () => {
    const draft = reduce(
      createInitialDraft(),
      { type: "detailsChanged", field: "possessionDate", value: "2030-01-01" },
      {
        type: "errorsReplaced",
        errors: {
          propertyDetailsErrors: { bedrooms: "Required" },
          pricingOthersErrors: { monthlyRent: "Required" },
        },
      },
      { type: "listingTypeChanged", listingType: "rent-lease" },
    );

    expect(draft.listingType).toBe("rent-lease");
    expect(draft.propertyDetails.possessionDate).toBe("");
    expect(draft.propertyDetails.ageOfConstruction).toBe(DEFAULT_RENT_AGE_OF_CONSTRUCTION);
    expect(draft.propertyDetailsErrors).toEqual({});
    expect(draft.pricingOthersErrors).toEqual({});
  });
});

describe("propertyTypeChanged", () => {
  it("returns the same state when the property type is unchanged", () => {
    const draft = createInitialDraft();

    expect(reduce(draft, { type: "propertyTypeChanged", propertyType: "residential" })).toBe(
      draft,
    );
  });

  it("forces rent for PG / co-living and has no sub type", () => {
    const draft = reduce(createInitialDraft(), {
      type: "propertyTypeChanged",
      propertyType: "pg-co-living",
    });

    expect(draft.listingType).toBe("rent-lease");
    expect(draft.propertySubTypes).toEqual([""]);
    expect(draft.propertyDetails.ageOfConstruction).toBe(DEFAULT_RENT_AGE_OF_CONSTRUCTION);
  });

  it("applies plot defaults and picks the first plot sub type", () => {
    const draft = reduce(createInitialDraft(), {
      type: "propertyTypeChanged",
      propertyType: "plot",
    });

    expect(draft.propertySubTypes).toEqual([SUB_TYPES_BY_PROPERTY_TYPE.plot![0].id]);
    expect(draft.propertyDetails.propertyTransaction).toBe("new");
    expect(draft.propertyDetails.managedBy).toBe("Landlord");
  });

  it("starts the later steps afresh but keeps the address", () => {
    const draft = reduce(
      createInitialDraft(),
      { type: "addressChanged", field: "locality", value: "Indiranagar" },
      { type: "detailsChanged", field: "bedrooms", value: "3" },
      { type: "amenitiesChanged", field: "facing", value: "East" },
      { type: "propertyTypeChanged", propertyType: "commercial" },
    );

    expect(draft.addressLocation.locality).toBe("Indiranagar");
    expect(draft.propertyDetails.bedrooms).toBe("");
    expect(draft.amenities.facing).toBe("");
  });
});

describe("subTypeChanged", () => {
  it("ignores the sub type that is already selected", () => {
    const draft = createInitialDraft();

    expect(reduce(draft, { type: "subTypeChanged", subType: draft.propertySubTypes[0] })).toBe(
      draft,
    );
  });

  it("resets the later steps for the new sub type", () => {
    const next = RESIDENTIAL_SUB_TYPES[1].id;
    const draft = reduce(
      createInitialDraft(),
      { type: "detailsChanged", field: "bedrooms", value: "3" },
      { type: "subTypeChanged", subType: next },
    );

    expect(draft.propertySubTypes).toEqual([next]);
    expect(draft.propertyDetails.bedrooms).toBe("");
  });
});

describe("subTypesChanged", () => {
  it("stores the selection and clears every step error", () => {
    const ids = RESIDENTIAL_SUB_TYPES.slice(0, 2).map((option) => option.id);
    const draft = reduce(
      createInitialDraft(),
      {
        type: "errorsReplaced",
        errors: { photosError: "Please add at least one photo", amenitiesErrors: { facing: "x" } },
      },
      { type: "subTypesChanged", subTypes: ids },
    );

    expect(draft.propertySubTypes).toEqual(ids);
    expect(draft.photosError).toBe("");
    expect(draft.amenitiesErrors).toEqual({});
  });
});

describe("field changes", () => {
  it("clears dependent details and their errors", () => {
    const draft = reduce(
      createInitialDraft(),
      { type: "detailsChanged", field: "floorNumber", value: "3" },
      {
        type: "errorsReplaced",
        errors: { propertyDetailsErrors: { floorNumber: "Required", bedrooms: "Required" } },
      },
      { type: "detailsChanged", field: "totalFloors", value: "10" },
    );

    expect(draft.propertyDetails.totalFloors).toBe("10");
    expect(draft.propertyDetails.floorNumber).toBe("");
    expect(draft.propertyDetailsErrors).toEqual({ bedrooms: "Required" });
  });

  it("clears only the error of the edited address field", () => {
    const draft = reduce(
      createInitialDraft(),
      {
        type: "errorsReplaced",
        errors: { addressLocationErrors: { locality: "Required", pinCode: "Required" } },
      },
      { type: "addressChanged", field: "locality", value: "Indiranagar" },
    );

    expect(draft.addressLocationErrors).toEqual({ pinCode: "Required" });
  });

  it("clears the furnishing error when the furnishing status changes", () => {
    const draft = reduce(
      createInitialDraft(),
      { type: "errorsReplaced", errors: { amenitiesErrors: { furnishing: "Required" } } },
      { type: "amenitiesChanged", field: "status", value: "furnished" },
    );

    expect(draft.amenitiesErrors).toEqual({});
  });

  it("clears the assured return error when pricing changes it", () => {
    const draft = reduce(
      createInitialDraft(),
      { type: "builderErrorsMerged", errors: { assuredReturn: "Out of range" } },
      { type: "pricingChanged", field: "assuredReturn", value: "8" },
    );

    expect(draft.pricingOthers.assuredReturn).toBe("8");
    expect(draft.builderErrors.assuredReturn).toBeUndefined();
  });

  it("clears the project type error when the project type changes", () => {
    const draft = reduce(
      createInitialDraft(),
      { type: "builderErrorsMerged", errors: { projectType: "Please select project type" } },
      { type: "projectDetailsChanged", field: "projectType", value: "Apartment" },
    );

    expect(draft.projectDetails.projectType).toBe("Apartment");
    expect(draft.builderErrors.projectType).toBeUndefined();
  });

  it("clears the photos error when photos change", () => {
    const draft = createInitialDraft();
    const next = reduce(
      draft,
      { type: "errorsReplaced", errors: { photosError: "Please add at least one photo" } },
      { type: "photosChanged", photos: draft.photosVideos },
    );

    expect(next.photosError).toBe("");
  });
});

describe("functional setters", () => {
  it("accepts a value or an updater function", () => {
    const draft = reduce(
      createInitialDraft(),
      { type: "detailsSet", update: { ...INITIAL_PROPERTY_DETAILS, bedrooms: "2" } },
      {
        type: "detailsSet",
        update: (current) => ({ ...current, bathrooms: `${current.bedrooms}-bath` }),
      },
    );

    expect(draft.propertyDetails.bedrooms).toBe("2");
    expect(draft.propertyDetails.bathrooms).toBe("2-bath");
  });
});

describe("existingMediaRemoved", () => {
  it("moves the media from existing to removed and clears the photos error", () => {
    const media = [{ id: "a" }, { id: "b" }] as PropertyMedia[];
    const draft = reduce(
      { ...createInitialDraft(), existingMedia: media, photosError: "Please add at least one photo" },
      { type: "existingMediaRemoved", mediaId: "a" },
    );

    expect(draft.existingMedia.map((item) => item.id)).toEqual(["b"]);
    expect(draft.removedMediaIds).toEqual(["a"]);
    expect(draft.photosError).toBe("");
  });
});

describe("errors and submit state", () => {
  it("merges builder errors without dropping existing ones", () => {
    const draft = reduce(
      createInitialDraft(),
      { type: "builderErrorsMerged", errors: { projectType: "x" } },
      { type: "builderErrorsMerged", errors: { assuredReturn: "y" } },
    );

    expect(draft.builderErrors).toEqual({ projectType: "x", assuredReturn: "y" });
  });

  it("tracks whether a submit is in flight", () => {
    const draft = reduce(createInitialDraft(), { type: "submittingChanged", isSubmitting: true });

    expect(draft.isSubmitting).toBe(true);
  });
});
