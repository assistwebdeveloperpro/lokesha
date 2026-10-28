const mockTrx = { fn: { now: jest.fn() } };

jest.mock("../../../../config/db", () => ({
  db: { transaction: jest.fn((callback) => callback(mockTrx)) },
}));
jest.mock("../repositories/property-draft.repository");
jest.mock("../repositories/property-write.repository");
jest.mock("./property-files.service");
jest.mock("../../../master/dashboard/admin-notifications/admin-notifications.service");

const { db } = require("../../../../config/db");
const draftRepository = require("../repositories/property-draft.repository");
const writeRepository = require("../repositories/property-write.repository");
const filesService = require("./property-files.service");
const { completeDraft } = require("./property-complete.service");

const DRAFT_ID = "3f2b8a52-6c5e-4d0e-9f53-0a1c2d3e4f50";
const user = { id: "user-1", role: "agent" };

const buildPayload = () => ({
  listingType: "sale",
  propertyType: "residential",
  address: { locality: "Vesu", pinCode: "395007", state: "Gujarat" },
  listings: [
    {
      propertySubType: "flat-apartment",
      description: "Nice flat",
      details: { bedrooms: 3, carpetArea: 1000 },
      pricing: { expectedPrice: 6000000 },
      selections: { tenantPreference: ["family"] },
      amenities: { amenities: ["lift"], furnishing: [] },
      files: { media: [{ path: `temp/drafts/${DRAFT_ID}/media-a.jpg`, category: "exterior" }] },
    },
  ],
});

const storedFile = { name: "media-a.jpg", size: 10, mimeType: "image/jpeg", mediaType: "image" };

beforeEach(() => {
  draftRepository.findDraftByIdForOwner.mockResolvedValue({ id: DRAFT_ID });
  writeRepository.findSubTypes.mockResolvedValue([{ id: "st-1", slug: "flat-apartment", name: "Flat/Apartment" }]);
  writeRepository.findActiveOptions.mockResolvedValue([{ id: "opt-1", option_group: "tenant_preference", option_key: "family" }]);
  writeRepository.findAllowedAmenities.mockResolvedValue([{ kind: "amenity", amenity_key: "lift" }]);
  writeRepository.findDraftForUpdate.mockResolvedValue({ id: DRAFT_ID });
  writeRepository.insertProperty.mockResolvedValue({ id: "prop-1", listing_number: "100001", status: "draft" });
  writeRepository.insertMedia.mockResolvedValue();
  filesService.inspectDraftFile.mockResolvedValue(storedFile);
  filesService.moveToProperty.mockResolvedValue("/uploads/properties/prop-1/media-a.jpg");
  filesService.removeDraftFolder.mockResolvedValue();
  filesService.restoreMoved.mockResolvedValue();
});

describe("completeDraft", () => {
  it("saves the listing, moves files and removes the draft", async () => {
    const result = await completeDraft(user, DRAFT_ID, { payload: buildPayload(), submit: false });

    expect(result).toEqual({
      projectId: null,
      properties: [{ id: "prop-1", listingNumber: 100001, status: "draft" }],
    });

    const propertyRow = writeRepository.insertProperty.mock.calls[0][1];
    expect(propertyRow).toMatchObject({
      user_id: "user-1",
      listed_by: "agent",
      property_type: "residential",
      property_sub_type_id: "st-1",
      title: "3 BHK Flat/Apartment in Vesu",
      price: 6000000,
      area_sqft: 1000,
    });
    expect(writeRepository.insertTypeRow).toHaveBeenCalledWith(mockTrx, "residential", {
      property_id: propertyRow.id,
      bedrooms: 3,
      carpet_area: 1000,
    });
    expect(writeRepository.insertSaleDetails).toHaveBeenCalledTimes(1);
    expect(writeRepository.insertSelections.mock.calls[0][1]).toEqual([
      { property_id: propertyRow.id, option_id: "opt-1" },
    ]);
    expect(writeRepository.insertMedia.mock.calls[0][1]).toEqual([
      expect.objectContaining({ category: "exterior", media_type: "image", file_path: "/uploads/properties/prop-1/media-a.jpg" }),
    ]);
    expect(writeRepository.deleteDraft).toHaveBeenCalledWith(mockTrx, DRAFT_ID, { userId: "user-1" });
    expect(filesService.removeDraftFolder).toHaveBeenCalledWith(DRAFT_ID);
  });

  it("moves the listing to pending when submitted", async () => {
    const result = await completeDraft(user, DRAFT_ID, { payload: buildPayload(), submit: true });

    expect(result.properties[0].status).toBe("pending");
    expect(writeRepository.updatePropertyStatus).toHaveBeenCalledWith(mockTrx, "prop-1", { status: "pending" });
    expect(writeRepository.insertStatusHistory).toHaveBeenLastCalledWith(
      mockTrx,
      expect.objectContaining({ from_status: "draft", to_status: "pending", changed_by_user_id: "user-1" })
    );
  });

  it("returns 404 when the draft is not the user's", async () => {
    draftRepository.findDraftByIdForOwner.mockResolvedValue(undefined);

    await expect(completeDraft(user, DRAFT_ID, { payload: buildPayload() })).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it("rejects an invalid payload before touching the database", async () => {
    const payload = buildPayload();
    payload.listings[0].description = "";

    await expect(completeDraft(user, DRAFT_ID, { payload })).rejects.toMatchObject({
      statusCode: 400,
      details: { fields: { "listings.0.description": expect.any(String) } },
    });
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it("rejects files that do not belong to the draft", async () => {
    filesService.inspectDraftFile.mockResolvedValue(null);

    await expect(completeDraft(user, DRAFT_ID, { payload: buildPayload() })).rejects.toMatchObject({
      statusCode: 400,
      details: { fields: { "listings.0.files.media.0": expect.any(String) } },
    });
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it("rejects the same file used twice", async () => {
    const payload = buildPayload();
    payload.listings[0].files.media.push({ ...payload.listings[0].files.media[0] });

    await expect(completeDraft(user, DRAFT_ID, { payload })).rejects.toMatchObject({
      details: { fields: { "listings.0.files.media.1": expect.any(String) } },
    });
  });

  it("rejects unknown options and amenities", async () => {
    writeRepository.findActiveOptions.mockResolvedValue([]);
    writeRepository.findAllowedAmenities.mockResolvedValue([]);

    await expect(completeDraft(user, DRAFT_ID, { payload: buildPayload() })).rejects.toMatchObject({
      details: {
        fields: {
          "listings.0.selections.tenantPreference": expect.any(String),
          "listings.0.amenities.amenities": expect.any(String),
        },
      },
    });
  });

  it("restores moved files and keeps the draft when saving fails", async () => {
    writeRepository.insertMedia.mockRejectedValue(new Error("insert failed"));

    await expect(completeDraft(user, DRAFT_ID, { payload: buildPayload() })).rejects.toThrow("insert failed");

    expect(filesService.restoreMoved).toHaveBeenCalledTimes(1);
    expect(filesService.removeDraftFolder).not.toHaveBeenCalled();
  });

  it("does not restore files when only the draft folder cleanup fails", async () => {
    filesService.removeDraftFolder.mockRejectedValue(new Error("busy"));
    jest.spyOn(console, "error").mockImplementation(() => {});

    await expect(completeDraft(user, DRAFT_ID, { payload: buildPayload() })).resolves.toBeDefined();

    expect(filesService.restoreMoved).not.toHaveBeenCalled();
  });

  it("does not trust postingAs for normal users", async () => {
    const payload = { ...buildPayload(), postingAs: "builder" };
    payload.project = { projectName: "Sneaky" };

    await expect(completeDraft(user, DRAFT_ID, { payload })).rejects.toMatchObject({
      details: { fields: { project: expect.any(String) } },
    });
  });
});
