const mockTrx = { fn: { now: jest.fn() } };

jest.mock("../../../../config/db", () => ({
  db: { transaction: jest.fn((callback) => callback(mockTrx)) },
}));
jest.mock("fs/promises", () => ({ rm: jest.fn().mockResolvedValue() }));
jest.mock("../repositories/property-edit.repository");
jest.mock("../repositories/property-read.repository");
jest.mock("../repositories/property-write.repository");
jest.mock("./property-files.service");
jest.mock("../../../master/dashboard/admin-notifications/admin-notifications.service");

const fs = require("fs/promises");
const editRepository = require("../repositories/property-edit.repository");
const readRepository = require("../repositories/property-read.repository");
const writeRepository = require("../repositories/property-write.repository");
const filesService = require("./property-files.service");
const service = require("./property-edit.service");

const PROPERTY_ID = "3f2b8a52-6c5e-4d0e-9f53-0a1c2d3e4f50";
const user = { id: "user-1", role: "agent" };

const locked = (overrides = {}) => ({
  id: PROPERTY_ID,
  status: "draft",
  listing_type: "sale",
  property_type: "residential",
  sub_type_slug: "flat-apartment",
  builder_project_id: null,
  ...overrides,
});

const buildPayload = () => ({
  listingType: "sale",
  propertyType: "residential",
  address: { locality: "Vesu", pinCode: "395007", state: "Gujarat" },
  listings: [
    {
      propertySubType: "flat-apartment",
      description: "Updated",
      details: { bedrooms: 2 },
      pricing: { expectedPrice: 5000000 },
    },
  ],
});

beforeEach(() => {
  editRepository.findPropertyForUpdate.mockResolvedValue(locked());
  // A property without siblings is a group of one
  editRepository.findGroupForUpdate.mockImplementation(async (...args) => {
    const property = await editRepository.findPropertyForUpdate(...args);
    return property ? [property] : [];
  });
  readRepository.findOwnedProperty.mockResolvedValue(locked());
  readRepository.findGroupSiblings.mockResolvedValue([]);
  writeRepository.findSubTypes.mockResolvedValue([{ id: "st-1", slug: "flat-apartment", name: "Flat/Apartment" }]);
  filesService.removePropertyFile.mockResolvedValue();
  filesService.removePropertyFolder.mockResolvedValue();
  filesService.getPropertyFilePaths.mockReturnValue({ publicPath: `/uploads/properties/${PROPERTY_ID}/media-a.jpg` });
  filesService.toMediaType.mockReturnValue("image");
});

describe("updateProperty", () => {
  it("returns 404 for a property the user does not own", async () => {
    readRepository.findOwnedProperty.mockResolvedValue(undefined);

    await expect(service.updateProperty(user, PROPERTY_ID, { payload: buildPayload() })).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("replaces the listing data inside one transaction", async () => {
    const result = await service.updateProperty(user, PROPERTY_ID, { payload: buildPayload() });

    expect(result).toEqual({ id: PROPERTY_ID, status: "draft" });
    expect(editRepository.updateProperty).toHaveBeenCalledWith(
      mockTrx,
      PROPERTY_ID,
      expect.objectContaining({ title: "2 BHK Flat/Apartment in Vesu", description: "Updated", city: null })
    );
    expect(editRepository.deleteListingChildren).toHaveBeenCalledWith(mockTrx, PROPERTY_ID);
    expect(writeRepository.insertTypeRow).toHaveBeenCalledWith(mockTrx, "residential", {
      property_id: PROPERTY_ID,
      bedrooms: 2,
    });
    expect(writeRepository.insertSaleDetails).toHaveBeenCalledTimes(1);
  });

  it("writes the listing type, property type and sub type on update", async () => {
    await service.updateProperty(user, PROPERTY_ID, { payload: buildPayload() });

    expect(editRepository.updateProperty).toHaveBeenCalledWith(
      mockTrx,
      PROPERTY_ID,
      expect.objectContaining({ listing_type: "sale", property_type: "residential", property_sub_type_id: "st-1" })
    );
  });

  describe("with several sub types", () => {
    const SIBLING_ID = "9a1c7e44-2b6d-4f0a-8c13-5d7e9f0a1b22";
    const builder = { id: "user-1", role: "builder" };
    const listingOf = (propertySubType) => ({
      ...buildPayload().listings[0],
      propertySubType,
      details: {},
      variants: [{ label: "2 BHK", price: 100, details: { bhk: 2 } }],
    });
    const buildGroupPayload = (...subTypes) => ({
      ...buildPayload(),
      project: { projectName: "Green Heights" },
      listings: subTypes.map(listingOf),
    });

    beforeEach(() => {
      readRepository.findOwnedProperty.mockResolvedValue(
        locked({ sub_type_slug: "flat-apartment", builder_project_id: "bp-1" })
      );
      readRepository.findGroupSiblings.mockResolvedValue([locked({ id: SIBLING_ID, sub_type_slug: "duplex" })]);
      editRepository.findGroupForUpdate.mockResolvedValue([
        locked({ builder_project_id: "bp-1" }),
        locked({ id: SIBLING_ID, builder_project_id: "bp-1" }),
      ]);
      writeRepository.findSubTypes.mockResolvedValue([
        { id: "st-1", slug: "flat-apartment", name: "Flat/Apartment" },
        { id: "st-2", slug: "duplex", name: "Duplex" },
      ]);
    });

    it("updates the property that was posted with each sub type", async () => {
      await service.updateProperty(builder, PROPERTY_ID, { payload: buildGroupPayload("flat-apartment", "duplex") });

      expect(editRepository.updateProperty).toHaveBeenCalledWith(mockTrx, PROPERTY_ID, expect.objectContaining({ property_sub_type_id: "st-1" }));
      expect(editRepository.updateProperty).toHaveBeenCalledWith(mockTrx, SIBLING_ID, expect.objectContaining({ property_sub_type_id: "st-2" }));
    });

    it("rejects an edit that leaves a sub type out", async () => {
      await expect(
        service.updateProperty(builder, PROPERTY_ID, { payload: buildGroupPayload("flat-apartment") })
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  it("sends a published listing back to review", async () => {
    editRepository.findPropertyForUpdate.mockResolvedValue(locked({ status: "published" }));

    const result = await service.updateProperty(user, PROPERTY_ID, { payload: buildPayload() });

    expect(result.status).toBe("pending");
    expect(writeRepository.insertStatusHistory).toHaveBeenCalledWith(
      mockTrx,
      expect.objectContaining({ from_status: "published", to_status: "pending", reason: "Edited by owner" })
    );
  });

  it("updates the shared project for builder listings", async () => {
    readRepository.findOwnedProperty.mockResolvedValue(locked({ builder_project_id: "bp-1" }));
    editRepository.findPropertyForUpdate.mockResolvedValue(locked({ builder_project_id: "bp-1" }));
    const payload = buildPayload();
    payload.project = { projectName: "Green Heights" };
    payload.listings[0].variants = [{ label: "2 BHK", price: 100, details: { bhk: 2 } }];
    payload.listings[0].details = {};

    await service.updateProperty({ id: "user-1", role: "builder" }, PROPERTY_ID, { payload });

    expect(writeRepository.updateBuilderProject).toHaveBeenCalledWith(
      mockTrx,
      "bp-1",
      expect.objectContaining({ project_name: "Green Heights", developer_name: null })
    );
    expect(writeRepository.deleteProjectChildren).toHaveBeenCalledWith(mockTrx, "bp-1");
  });
});

describe("status changes", () => {
  it.each(["draft", "rejected"])("submits a %s listing for review", async (status) => {
    editRepository.findPropertyForUpdate.mockResolvedValue(locked({ status }));

    await expect(service.submitProperty(user, PROPERTY_ID)).resolves.toEqual({ id: PROPERTY_ID, status: "pending" });
  });

  it("reopens an unchanged closed listing as published", async () => {
    const closedAt = new Date("2026-10-20T10:00:00Z");
    editRepository.findPropertyForUpdate.mockResolvedValue(locked({ status: "closed", updated_at: closedAt }));
    writeRepository.findLastStatusChangeAt.mockResolvedValue(closedAt);

    await expect(service.submitProperty(user, PROPERTY_ID)).resolves.toEqual({ id: PROPERTY_ID, status: "published" });
  });

  it("sends a closed listing edited since closing back to review", async () => {
    editRepository.findPropertyForUpdate.mockResolvedValue(
      locked({ status: "closed", updated_at: new Date("2026-10-21T10:00:00Z") })
    );
    writeRepository.findLastStatusChangeAt.mockResolvedValue(new Date("2026-10-20T10:00:00Z"));

    await expect(service.submitProperty(user, PROPERTY_ID)).resolves.toEqual({ id: PROPERTY_ID, status: "pending" });
  });

  it.each(["pending", "published"])("does not submit a %s listing", async (status) => {
    editRepository.findPropertyForUpdate.mockResolvedValue(locked({ status }));

    await expect(service.submitProperty(user, PROPERTY_ID)).rejects.toMatchObject({ statusCode: 409 });
  });

  it("closes only a published listing", async () => {
    editRepository.findPropertyForUpdate.mockResolvedValue(locked({ status: "published" }));
    await expect(service.closeProperty(user, PROPERTY_ID)).resolves.toEqual({ id: PROPERTY_ID, status: "closed" });

    editRepository.findPropertyForUpdate.mockResolvedValue(locked({ status: "draft" }));
    await expect(service.closeProperty(user, PROPERTY_ID)).rejects.toMatchObject({ statusCode: 409 });
  });

  it("returns 404 for another user's property", async () => {
    editRepository.findPropertyForUpdate.mockResolvedValue(undefined);

    await expect(service.submitProperty(user, PROPERTY_ID)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("a post with several sub types", () => {
  const SIBLING_ID = "9a1c7e44-2b6d-4f0a-8c13-5d7e9f0a1b22";

  beforeEach(() => {
    editRepository.findGroupForUpdate.mockResolvedValue([locked(), locked({ id: SIBLING_ID })]);
  });

  it("submits every sub type together", async () => {
    await expect(service.submitProperty(user, PROPERTY_ID)).resolves.toEqual({ id: PROPERTY_ID, status: "pending" });

    expect(writeRepository.updatePropertyStatus).toHaveBeenCalledWith(mockTrx, PROPERTY_ID, expect.objectContaining({ status: "pending" }));
    expect(writeRepository.updatePropertyStatus).toHaveBeenCalledWith(mockTrx, SIBLING_ID, expect.objectContaining({ status: "pending" }));
  });

  it("closes every sub type together", async () => {
    editRepository.findGroupForUpdate.mockResolvedValue([
      locked({ status: "published" }),
      locked({ id: SIBLING_ID, status: "published" }),
    ]);

    await service.closeProperty(user, PROPERTY_ID);

    expect(writeRepository.updatePropertyStatus).toHaveBeenCalledWith(mockTrx, SIBLING_ID, expect.objectContaining({ status: "closed" }));
  });

  it("deletes every sub type and the folder of each", async () => {
    await service.deleteProperty(user, PROPERTY_ID);

    expect(editRepository.deleteProperty).toHaveBeenCalledWith(mockTrx, SIBLING_ID);
    expect(filesService.removePropertyFolder).toHaveBeenCalledWith(SIBLING_ID);
  });
});

describe("deleteProperty", () => {
  it("deletes the row, then its folder", async () => {
    await service.deleteProperty(user, PROPERTY_ID);

    expect(editRepository.deleteProperty).toHaveBeenCalledWith(mockTrx, PROPERTY_ID);
    expect(editRepository.deleteProject).not.toHaveBeenCalled();
    expect(filesService.removePropertyFolder).toHaveBeenCalledWith(PROPERTY_ID);
  });

  it("deletes the builder project with its last listing only", async () => {
    editRepository.findPropertyForUpdate.mockResolvedValue(locked({ builder_project_id: "bp-1" }));

    editRepository.countProjectProperties.mockResolvedValue(1);
    await service.deleteProperty(user, PROPERTY_ID);
    expect(editRepository.deleteProject).not.toHaveBeenCalled();

    editRepository.countProjectProperties.mockResolvedValue(0);
    await service.deleteProperty(user, PROPERTY_ID);
    expect(editRepository.deleteProject).toHaveBeenCalledWith(mockTrx, "bp-1");
  });

  it("does not touch files when the property is not found", async () => {
    editRepository.findPropertyForUpdate.mockResolvedValue(undefined);

    await expect(service.deleteProperty(user, PROPERTY_ID)).rejects.toMatchObject({ statusCode: 404 });
    expect(filesService.removePropertyFolder).not.toHaveBeenCalled();
  });
});

describe("addPropertyFile", () => {
  const file = {
    path: "/disk/media-a.jpg",
    filename: "media-a.jpg",
    originalname: "a.jpg",
    mimetype: "image/jpeg",
    size: 10,
  };

  beforeEach(() => {
    editRepository.countMedia.mockResolvedValue(0);
    editRepository.countFloorPlans.mockResolvedValue(0);
    editRepository.insertMedia.mockImplementation(async (trx, row) => ({ id: "m1", ...row }));
    editRepository.insertFloorPlan.mockImplementation(async (trx, row) => ({ id: "f1", ...row }));
  });

  it("stores a photo and returns it", async () => {
    const result = await service.addPropertyFile(user, PROPERTY_ID, {
      file,
      kind: "media",
      meta: { category: "exterior" },
    });

    expect(result.media).toMatchObject({ id: "m1", category: "exterior", mediaType: "image" });
    expect(result.status).toBe("draft");
    expect(fs.rm).not.toHaveBeenCalled();
  });

  it("stores a floor plan with the default plan type", async () => {
    const result = await service.addPropertyFile(user, PROPERTY_ID, { file, kind: "floor-plan", meta: {} });

    expect(result.floorPlan).toMatchObject({ id: "f1", planType: "2d" });
  });

  it("stores a brochure with the brochure category", async () => {
    await service.addPropertyFile(user, PROPERTY_ID, { file, kind: "brochure", meta: {} });

    expect(editRepository.insertMedia.mock.calls[0][1]).toMatchObject({ category: "brochure" });
  });

  it.each([
    ["photo category missing", { kind: "media", meta: {} }, () => {}, 400],
    ["too many photos", { kind: "media", meta: { category: "exterior" } }, () => editRepository.countMedia.mockResolvedValue(50), 409],
    ["second brochure", { kind: "brochure", meta: {} }, () => editRepository.countMedia.mockResolvedValue(1), 409],
    ["too many floor plans", { kind: "floor-plan", meta: {} }, () => editRepository.countFloorPlans.mockResolvedValue(20), 409],
  ])("rejects and removes the upload: %s", async (name, input, arrange, status) => {
    arrange();

    await expect(service.addPropertyFile(user, PROPERTY_ID, { file, ...input })).rejects.toMatchObject({
      statusCode: status,
    });
    expect(fs.rm).toHaveBeenCalledWith(file.path, { force: true });
  });

  it("requires a file", async () => {
    await expect(service.addPropertyFile(user, PROPERTY_ID, { kind: "media", meta: {} })).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});

describe("removeMedia and removeFloorPlan", () => {
  it("deletes the row and then the stored file", async () => {
    editRepository.findMediaById.mockResolvedValue({ id: "m1", file_path: "/uploads/properties/p/a.jpg" });

    await expect(service.removeMedia(user, PROPERTY_ID, "m1")).resolves.toEqual({ status: "draft" });

    expect(editRepository.deleteMedia).toHaveBeenCalledWith(mockTrx, "m1");
    expect(filesService.removePropertyFile).toHaveBeenCalledWith(PROPERTY_ID, "/uploads/properties/p/a.jpg");
  });

  it("returns 404 and keeps the file for an unknown id", async () => {
    editRepository.findFloorPlanById.mockResolvedValue(undefined);

    await expect(service.removeFloorPlan(user, PROPERTY_ID, "f1")).rejects.toMatchObject({ statusCode: 404 });
    expect(filesService.removePropertyFile).not.toHaveBeenCalled();
  });

  it("sends a published listing back to review", async () => {
    editRepository.findPropertyForUpdate.mockResolvedValue(locked({ status: "published" }));
    editRepository.findFloorPlanById.mockResolvedValue({ id: "f1", file_path: "/uploads/properties/p/f.png" });

    await expect(service.removeFloorPlan(user, PROPERTY_ID, "f1")).resolves.toEqual({ status: "pending" });
  });
});
