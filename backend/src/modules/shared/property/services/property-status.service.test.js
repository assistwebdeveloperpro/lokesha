jest.mock("../repositories/property-write.repository");
jest.mock("../../../master/dashboard/admin-notifications/admin-notifications.service");

const writeRepository = require("../repositories/property-write.repository");
const adminNotifications = require("../../../master/dashboard/admin-notifications/admin-notifications.service");
const { assertTransition, changeStatus, markEdited } = require("./property-status.service");

const trx = { fn: { now: jest.fn() } };
const ADMIN_LISTING_ACTOR = { adminId: "admin-1", bypassReview: true };
const REVIEWER_ACTOR = { adminId: "admin-1" };

beforeEach(() => jest.clearAllMocks());

describe("assertTransition", () => {
  it("lets admin listings go live and be closed and reopened", () => {
    expect(() => assertTransition("draft", "published", ADMIN_LISTING_ACTOR)).not.toThrow();
    expect(() => assertTransition("published", "closed", ADMIN_LISTING_ACTOR)).not.toThrow();
    expect(() => assertTransition("closed", "published", ADMIN_LISTING_ACTOR)).not.toThrow();
  });

  it("never sends admin listings to review or rejects them", () => {
    expect(() => assertTransition("draft", "pending", ADMIN_LISTING_ACTOR)).toThrow(/Cannot change status/);
    expect(() => assertTransition("published", "pending", ADMIN_LISTING_ACTOR)).toThrow(/Cannot change status/);
    expect(() => assertTransition("pending", "rejected", ADMIN_LISTING_ACTOR)).toThrow(/Cannot change status/);
  });

  it("keeps the review rules for users and reviewing admins", () => {
    expect(() => assertTransition("draft", "published", { userId: "user-1" })).toThrow(/Cannot change status/);
    expect(() => assertTransition("draft", "pending", { userId: "user-1" })).not.toThrow();
    expect(() => assertTransition("pending", "published", REVIEWER_ACTOR)).not.toThrow();
    expect(() => assertTransition("pending", "rejected", REVIEWER_ACTOR)).not.toThrow();
  });
});

describe("changeStatus", () => {
  it("publishes an admin draft without telling the reviewers", async () => {
    await changeStatus(trx, { propertyId: "p-1", from: "draft", to: "published", actor: ADMIN_LISTING_ACTOR });

    expect(writeRepository.updatePropertyStatus).toHaveBeenCalledWith(
      trx,
      "p-1",
      expect.objectContaining({ status: "published" })
    );
    expect(writeRepository.insertStatusHistory).toHaveBeenCalledWith(
      trx,
      expect.objectContaining({ changed_by_admin_id: "admin-1", changed_by_user_id: null, to_status: "published" })
    );
    expect(adminNotifications.notifyPropertyPending).not.toHaveBeenCalled();
  });
});

describe("markEdited", () => {
  it("sends a published user listing back to review", async () => {
    const status = await markEdited(trx, { id: "p-1", status: "published" }, { userId: "user-1" });

    expect(status).toBe("pending");
  });

  it("keeps a published listing published when an admin edits it", async () => {
    const status = await markEdited(trx, { id: "p-1", status: "published" }, ADMIN_LISTING_ACTOR);

    expect(status).toBe("published");
    expect(writeRepository.updatePropertyStatus).not.toHaveBeenCalled();
  });
});
