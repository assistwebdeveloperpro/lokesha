import { describe, expect, it } from "vitest";
import { createInitialProjectDetails } from "@/components/master/post-property/postPropertyProjectDetails";
import type { DraftFormData } from "@/services/property.service";
import { EMPTY_SUB_TYPE_FORMS_SNAPSHOT } from "../hooks/useSubTypeForms";
import {
  DRAFT_SNAPSHOT_VERSION,
  createDraftFormData,
  hydrateFormState,
  type DraftSnapshotInput,
} from "./postPropertyDraftSnapshot";
import { createInitialDraft, postPropertyReducer } from "./postPropertyFormReducer";
import { INITIAL_ADDRESS_LOCATION, INITIAL_PROPERTY_DETAILS } from "./postPropertyInitialValues";

function buildInput(overrides: Partial<DraftSnapshotInput> = {}): DraftSnapshotInput {
  const initial = createInitialDraft();

  return {
    form: {
      listingType: initial.listingType,
      propertyType: initial.propertyType,
      propertySubTypes: initial.propertySubTypes,
      addressLocation: { ...INITIAL_ADDRESS_LOCATION, locality: "Vesu", projectName: "Sky Towers" },
      propertyDetails: { ...INITIAL_PROPERTY_DETAILS, bedrooms: "3" },
      amenities: initial.amenities,
      pricingOthers: initial.pricingOthers,
      projectDetails: initial.projectDetails,
      photosVideos: initial.photosVideos,
    },
    postingAs: "",
    tabs: EMPTY_SUB_TYPE_FORMS_SNAPSHOT,
    ...overrides,
  };
}

// What the server returns: the saved JSON, without functions or class instances
const throughJson = (formData: DraftFormData) => JSON.parse(JSON.stringify(formData)) as DraftFormData;

describe("createDraftFormData", () => {
  it("adds the version and a summary for the draft list", () => {
    const formData = createDraftFormData(buildInput());

    expect(formData.version).toBe(DRAFT_SNAPSHOT_VERSION);
    expect(formData.summary).toEqual({
      listingType: "sale",
      propertyType: "residential",
      subTypes: ["flat-apartment"],
      locality: "Vesu",
    });
  });

  it("leaves the locality out of the summary while it is empty", () => {
    const input = buildInput();
    input.form.addressLocation = INITIAL_ADDRESS_LOCATION;

    expect(createDraftFormData(input).summary?.locality).toBeUndefined();
  });

  it("removes files that are not on the server from the project details", () => {
    const input = buildInput();
    const file = new File(["x"], "plan.png");
    input.form.projectDetails = {
      ...input.form.projectDetails,
      brochureImages: [{ id: "b1", file, previewUrl: "blob:b1", status: "uploading" }],
      floorPlans: [{ id: "f1", label: "Hall", planType: "2d", file, previewUrl: "blob:f1" }],
    };

    const { projectDetails } = createDraftFormData(input).form as DraftSnapshotInput["form"];

    expect(projectDetails.brochureImages).toEqual([]);
    expect(projectDetails.floorPlans).toEqual([
      { id: "f1", label: "Hall", planType: "2d", file: null, previewUrl: "" },
    ]);
  });

  it("keeps uploaded files as references without browser data", () => {
    const input = buildInput();
    const file = new File(["x"], "a.jpg");
    const remote = { id: "media-1.jpg", path: "temp/drafts/d/media-1.jpg" };
    input.form.photosVideos.mediaByCategory.exterior = [
      { id: "p1", name: "a.jpg", type: "image", previewUrl: "blob:p1", status: "uploaded", remote },
      { id: "p2", name: "b.jpg", type: "image", previewUrl: "blob:p2", status: "uploading", file },
      { id: "p3", name: "c.jpg", type: "image", previewUrl: "blob:p3", status: "error", file },
      { id: "p4", name: "d.jpg", type: "image", previewUrl: "blob:p4", status: "local", file },
    ];
    input.form.photosVideos.brochure = {
      id: "p5",
      name: "b.pdf",
      type: "image",
      previewUrl: "blob:p5",
      status: "uploaded",
      remote,
    };
    input.form.projectDetails = {
      ...input.form.projectDetails,
      brochureImages: [{ id: "b1", name: "x.jpg", previewUrl: "blob:b1", status: "uploaded", remote }],
      floorPlans: [{ id: "f1", label: "Hall", planType: "3d", file: null, previewUrl: "blob:f1", status: "uploaded", remote }],
    };

    const { form } = createDraftFormData(input) as unknown as { form: DraftSnapshotInput["form"] };

    expect(form.photosVideos.mediaByCategory.exterior).toEqual([
      { id: "p1", name: "a.jpg", type: "image", status: "uploaded", remote, previewUrl: "" },
    ]);
    expect(form.photosVideos.brochure).toMatchObject({ id: "p5", remote, previewUrl: "" });
    expect(form.projectDetails.brochureImages).toEqual([
      { id: "b1", name: "x.jpg", status: "uploaded", remote, previewUrl: "" },
    ]);
    expect(form.projectDetails.floorPlans).toEqual([
      { id: "f1", label: "Hall", planType: "3d", file: null, previewUrl: "", status: "uploaded", remote },
    ]);
    expect(JSON.stringify(form)).not.toContain("blob:");
  });

  it("can be saved as JSON", () => {
    expect(() => JSON.stringify(createDraftFormData(buildInput()))).not.toThrow();
  });
});

describe("hydrateFormState", () => {
  it("restores what was saved", () => {
    const restored = hydrateFormState(throughJson(createDraftFormData(buildInput({ postingAs: "builder" }))));

    expect(restored?.form.addressLocation.locality).toBe("Vesu");
    expect(restored?.form.propertyDetails.bedrooms).toBe("3");
    expect(restored?.form.propertySubTypes).toEqual(["flat-apartment"]);
    expect(restored?.postingAs).toBe("builder");
  });

  it("returns null for another version or a missing form", () => {
    const saved = throughJson(createDraftFormData(buildInput()));

    expect(hydrateFormState({ ...saved, version: 99 })).toBeNull();
    expect(hydrateFormState({})).toBeNull();
    expect(hydrateFormState({ version: DRAFT_SNAPSHOT_VERSION, form: "broken" })).toBeNull();
  });

  it("returns null for an unknown listing or property type", () => {
    const saved = throughJson(createDraftFormData(buildInput()));

    expect(hydrateFormState({ ...saved, form: { ...(saved.form as object), propertyType: "castle" } })).toBeNull();
    expect(hydrateFormState({ ...saved, form: { ...(saved.form as object), listingType: "swap" } })).toBeNull();
  });

  it("fills fields added after the draft was saved", () => {
    const saved = throughJson(createDraftFormData(buildInput()));
    const form = saved.form as { addressLocation: Record<string, unknown> };
    delete form.addressLocation.landmark;

    expect(hydrateFormState(saved)?.form.addressLocation.landmark).toBe("");
  });

  it("drops sub types the property type does not have and falls back to the first", () => {
    const saved = throughJson(createDraftFormData(buildInput()));
    const restored = hydrateFormState({
      ...saved,
      form: { ...(saved.form as object), propertySubTypes: ["shop", "ghost"] },
    });

    expect(restored?.form.propertySubTypes).toEqual(["flat-apartment"]);
  });

  it("keeps the empty sub type of PG listings", () => {
    const input = buildInput();
    input.form = { ...input.form, propertyType: "pg-co-living", listingType: "rent-lease", propertySubTypes: [""] };

    expect(hydrateFormState(throughJson(createDraftFormData(input)))?.form.propertySubTypes).toEqual([""]);
  });

  it("ignores an unknown posting as value", () => {
    const saved = throughJson(createDraftFormData(buildInput()));

    expect(hydrateFormState({ ...saved, postingAs: "admin" })?.postingAs).toBe("");
  });

  it("restores the tab values of the selected sub types only", () => {
    const input = buildInput();
    input.form = { ...input.form, propertySubTypes: ["flat-apartment", "duplex"] };
    input.tabs = {
      activeId: "duplex",
      details: {
        duplex: { ...INITIAL_PROPERTY_DETAILS, bedrooms: "4" },
        shop: { ...INITIAL_PROPERTY_DETAILS, bedrooms: "9" },
      },
      areaMax: {},
      amenities: {},
      pricing: {},
      photos: {},
    };

    const { tabs } = hydrateFormState(throughJson(createDraftFormData(input))) ?? {};

    expect(tabs?.activeId).toBe("duplex");
    expect(Object.keys(tabs?.details ?? {})).toEqual(["duplex"]);
    expect(tabs?.details.duplex.bedrooms).toBe("4");
  });

  it("falls back to the initial project details when they were not saved", () => {
    const saved = throughJson(createDraftFormData(buildInput()));
    delete (saved.form as Record<string, unknown>).projectDetails;

    const initial = createInitialProjectDetails("");
    const project = hydrateFormState(saved)?.form.projectDetails;

    expect(project?.projectType).toBe(initial.projectType);
    expect(project?.specifications.length).toBe(initial.specifications.length);
    expect(project?.brochureImages).toEqual([]);
  });
});

describe("hydrateFormState files", () => {
  const remote = { id: "media-1.jpg", path: "temp/drafts/d/media-1.jpg" };

  function savedWithFiles() {
    const input = buildInput();
    input.form.photosVideos.mediaByCategory.kitchen = [
      { id: "p1", name: "a.jpg", type: "video", previewUrl: "blob:p1", status: "uploaded", remote },
    ];
    input.form.projectDetails = {
      ...input.form.projectDetails,
      brochureImages: [{ id: "b1", name: "x.jpg", previewUrl: "", status: "uploaded", remote }],
      floorPlans: [{ id: "f1", label: "Hall", planType: "2d", file: null, previewUrl: "", status: "uploaded", remote }],
    };
    input.form = { ...input.form, propertySubTypes: ["flat-apartment", "duplex"] };
    const photos = createInitialDraft().photosVideos;
    photos.mediaByCategory.exterior = [
      { id: "t1", name: "t.jpg", type: "image", previewUrl: "", status: "uploaded", remote },
    ];
    input.tabs = { ...EMPTY_SUB_TYPE_FORMS_SNAPSHOT, photos: { duplex: photos, shop: photos } };
    return throughJson(createDraftFormData(input));
  }

  it("restores uploaded files as uploaded items that still need a preview", () => {
    const restored = hydrateFormState(savedWithFiles());

    expect(restored?.form.photosVideos.mediaByCategory.kitchen).toEqual([
      { id: "p1", name: "a.jpg", type: "video", status: "uploaded", remote, previewUrl: "" },
    ]);
    expect(restored?.form.projectDetails.brochureImages).toHaveLength(1);
    expect(restored?.form.projectDetails.floorPlans[0]).toMatchObject({ label: "Hall", status: "uploaded", remote });
    expect(Object.keys(restored?.tabs.photos ?? {})).toEqual(["duplex"]);
    expect(restored?.tabs.photos.duplex.mediaByCategory.exterior[0].remote).toEqual(remote);
  });

  it("drops saved files that have no stored reference", () => {
    const saved = savedWithFiles();
    const form = saved.form as { photosVideos: { mediaByCategory: Record<string, unknown[]> } };
    form.photosVideos.mediaByCategory.kitchen = [{ id: "bad" }, "junk", null];

    expect(hydrateFormState(saved)?.form.photosVideos.mediaByCategory.kitchen).toEqual([]);
  });

  it("starts without files when none were saved", () => {
    const saved = savedWithFiles();
    delete (saved.form as Record<string, unknown>).photosVideos;
    delete (saved.tabs as Record<string, unknown>).photos;

    const restored = hydrateFormState(saved);

    expect(restored?.form.photosVideos.brochure).toBeNull();
    expect(restored?.tabs.photos).toEqual({});
  });
});

describe("draftRestored", () => {
  it("replaces the form and clears errors and photos", () => {
    const restored = hydrateFormState(throughJson(createDraftFormData(buildInput())));
    const dirty = {
      ...createInitialDraft(),
      photosError: "Please add at least one photo",
      isSubmitting: true,
    };

    const next = postPropertyReducer(dirty, { type: "draftRestored", form: restored!.form });

    expect(next.addressLocation.locality).toBe("Vesu");
    expect(next.photosError).toBe("");
    expect(next.isSubmitting).toBe(false);
    expect(next.existingMedia).toEqual([]);
  });
});
