const mockTrx = {};

jest.mock("../../../../config/db", () => ({ db: { transaction: (callback) => callback(mockTrx) } }));
jest.mock("./property-review.repository");
jest.mock("../../../user/dashboard/user-notifications/user-notifications.repository");
jest.mock("../../../landing/property/property-read.repository");
jest.mock("../../../landing/property/property-read.service", () => ({ buildPropertyDetail: jest.fn() }));
jest.mock("../../../landing/property/property-status.service", () => ({
  changeStatus: jest.fn(),
}));

const reviewRepository = require("./property-review.repository");
const notificationRepository = require("../../../user/dashboard/user-notifications/user-notifications.repository");
const readRepository = require("../../../landing/property/property-read.repository");
const { buildPropertyDetail } = require("../../../landing/property/property-read.service");
const { changeStatus } = require("../../../landing/property/property-status.service");
const { listProperties, getProperty, approveProperty, rejectProperty } = require("./property-review.service");

const admin = { id: "admin-1" };

const owner = { owner_name: "Asha", owner_email: "asha@example.com", owner_mobile: "9999999999" };

beforeEach(() => {
  jest.clearAllMocks();
  // A property without siblings is a group of one
  reviewRepository.findGroupForUpdate.mockImplementation(async (...args) => {
    const property = await reviewRepository.findPropertyForUpdate(...args);
    return property ? [property] : [];
  });
});

describe("listProperties", () => {
  it("returns the page with the owner of each listing", async () => {
    reviewRepository.findListings.mockResolvedValue([
      {
        id: "p1",
        listing_number: "100001",
        price: "5000000",
        status: "pending",
        listing_type: "sale",
        property_type: "pg",
        member_ids: ["p1"],
        sub_type_slugs: ["pg"],
        sub_type_names: ["PG"],
        ...owner,
      },
    ]);
    reviewRepository.countListings.mockResolvedValue(21);
    readRepository.findImagesByPropertyIds.mockResolvedValue([]);

    const result = await listProperties({ page: 2, limit: 10, status: "pending", propertyType: "pg-co-living" });

    expect(reviewRepository.findListings).toHaveBeenCalledWith(expect.objectContaining({ propertyType: "pg", status: "pending" }));
    expect(result).toMatchObject({ page: 2, limit: 10, total: 21 });
    expect(result.items[0]).toMatchObject({
      id: "p1",
      price: 5000000,
      owner: { name: "Asha", email: "asha@example.com", mobile: "9999999999" },
    });
  });
});

describe("getProperty", () => {
  it("builds the detail with the owner's role", async () => {
    reviewRepository.findPropertyWithOwner.mockResolvedValue({ id: "p1", owner_role: "lokesha_staff", ...owner });
    buildPropertyDetail.mockResolvedValue({ property: { id: "p1" } });

    const result = await getProperty("p1");

    expect(buildPropertyDetail).toHaveBeenCalledWith(expect.objectContaining({ id: "p1" }), "lokesha_staff");
    expect(result).toMatchObject({ property: { id: "p1" }, owner: { name: "Asha" } });
  });

  it("answers 404 for an unknown property", async () => {
    reviewRepository.findPropertyWithOwner.mockResolvedValue(undefined);

    await expect(getProperty("missing")).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("approveProperty and rejectProperty", () => {
  const pending = { id: "p1", status: "pending", user_id: "u1", title: "Sky Towers" };

  it("decides every sub type of the post but tells the owner once", async () => {
    reviewRepository.findGroupForUpdate.mockResolvedValue([pending, { ...pending, id: "p2" }]);

    await approveProperty(admin, "p1");

    expect(changeStatus).toHaveBeenCalledTimes(2);
    expect(changeStatus).toHaveBeenCalledWith(mockTrx, expect.objectContaining({ propertyId: "p2", to: "published" }));
    expect(notificationRepository.insertNotification).toHaveBeenCalledTimes(1);
  });

  it("tells the owner when the property is approved", async () => {
    reviewRepository.findPropertyForUpdate.mockResolvedValue(pending);

    await approveProperty(admin, "p1");

    expect(notificationRepository.insertNotification).toHaveBeenCalledWith(
      mockTrx,
      expect.objectContaining({
        user_id: "u1",
        property_id: "p1",
        type: "property_approved",
        title: "Sky Towers",
      })
    );
  });

  it("tells the owner why the property is rejected", async () => {
    reviewRepository.findPropertyForUpdate.mockResolvedValue(pending);

    await rejectProperty(admin, "p1", { reason: "Photos are blurry" });

    expect(notificationRepository.insertNotification).toHaveBeenCalledWith(
      mockTrx,
      expect.objectContaining({ type: "property_rejected", message: expect.stringContaining("Photos are blurry") })
    );
  });

  it("sends no notification when the decision fails", async () => {
    reviewRepository.findPropertyForUpdate.mockResolvedValue({ ...pending, status: "published" });
    changeStatus.mockRejectedValueOnce(Object.assign(new Error("Cannot change status"), { statusCode: 409 }));

    await expect(approveProperty(admin, "p1")).rejects.toMatchObject({ statusCode: 409 });
    expect(notificationRepository.insertNotification).not.toHaveBeenCalled();
  });

  it("publishes a property under the admin's name", async () => {
    reviewRepository.findPropertyForUpdate.mockResolvedValue({ id: "p1", status: "pending" });

    const result = await approveProperty(admin, "p1");

    expect(changeStatus).toHaveBeenCalledWith(mockTrx, {
      propertyId: "p1",
      from: "pending",
      to: "published",
      actor: { adminId: "admin-1" },
      reason: undefined,
    });
    expect(result).toEqual({ message: "Property approved", id: "p1", status: "published" });
  });

  it("rejects a property with the reason", async () => {
    reviewRepository.findPropertyForUpdate.mockResolvedValue({ id: "p1", status: "pending" });

    const result = await rejectProperty(admin, "p1", { reason: "Photos are blurry" });

    expect(changeStatus).toHaveBeenCalledWith(
      mockTrx,
      expect.objectContaining({ to: "rejected", reason: "Photos are blurry", actor: { adminId: "admin-1" } })
    );
    expect(result).toMatchObject({ status: "rejected" });
  });

  it("answers 404 when the property does not exist", async () => {
    reviewRepository.findPropertyForUpdate.mockResolvedValue(undefined);

    await expect(approveProperty(admin, "missing")).rejects.toMatchObject({ statusCode: 404 });
    expect(changeStatus).not.toHaveBeenCalled();
  });

  it("passes on the conflict when the property is not waiting for review", async () => {
    reviewRepository.findPropertyForUpdate.mockResolvedValue({ id: "p1", status: "published" });
    changeStatus.mockRejectedValue(Object.assign(new Error("Cannot change status"), { statusCode: 409 }));

    await expect(approveProperty(admin, "p1")).rejects.toMatchObject({ statusCode: 409 });
  });
});
