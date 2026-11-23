const mockTrx = {};

jest.mock("../../../../config/db", () => ({ db: { transaction: (callback) => callback(mockTrx) } }));
jest.mock("./leads.repository");
jest.mock("../../../user/dashboard/user-notifications/user-notifications.repository");
jest.mock("../../../shared/subscription/services/subscription-lead-limit.service");

const repository = require("./leads.repository");
const leadLimitService = require("../../../shared/subscription/services/subscription-lead-limit.service");
const notificationRepository = require("../../../user/dashboard/user-notifications/user-notifications.repository");
const { leadsListQuerySchema, leadIdParamSchema } = require("./leads.validation");
const { listLeads, sendLeadToLister } = require("./leads.service");

const row = {
  id: "lead-1",
  lister_role: "agent",
  phone_revealed: false,
  verification_status: "not_verified",
  distribution_status: "not_sent",
  sent_at: null,
  lister_user_id: "user-9",
  lead_name: "Ravi",
  lead_mobile: "9111111111",
  lead_email: "ravi@example.com",
  lister_name: "Asha",
  lister_mobile: "9000000001",
  lister_listed_by: "lokesha_staff",
  created_at: "2026-11-06T10:00:00.000Z",
  property_id: "prop-1",
  listing_number: "100001",
  property_title: "2 BHK Flat",
  property_type: "residential",
  listing_type: "sale",
  locality: "Bopal",
  city: "Ahmedabad",
  project_name: null,
};

beforeEach(() => jest.clearAllMocks());

describe("listLeads", () => {
  it("maps rows into the admin lead shape with pagination", async () => {
    repository.findLeads.mockResolvedValue([row]);
    repository.countLeads.mockResolvedValue(11);

    const result = await listLeads({ page: 2, limit: 10 });

    expect(result.total).toBe(11);
    expect(result.page).toBe(2);
    expect(result.items[0]).toMatchObject({
      id: "lead-1",
      lead: { name: "Ravi", mobile: "9111111111", email: "ravi@example.com" },
      property: { title: "2 BHK Flat", listingNumber: 100001, locality: "Bopal" },
      lister: { name: "Asha", listedBy: "lokesha_staff" },
      contactRole: "agent",
      phoneRevealed: false,
      verificationStatus: "not_verified",
      distributionStatus: "not_sent",
      sentAt: null,
      canSendToLister: true,
    });
  });

  it("marks admin-posted leads as not sendable", async () => {
    repository.findLeads.mockResolvedValue([{ ...row, lister_user_id: null }]);
    repository.countLeads.mockResolvedValue(1);

    const result = await listLeads({ page: 1, limit: 10 });

    expect(result.items[0].canSendToLister).toBe(false);
  });

  it("prefers the project name over the property title", async () => {
    repository.findLeads.mockResolvedValue([{ ...row, project_name: "Sky Heights" }]);
    repository.countLeads.mockResolvedValue(1);

    const result = await listLeads({ page: 1, limit: 10 });

    expect(result.items[0].property.title).toBe("Sky Heights");
  });
});

describe("leadsListQuerySchema", () => {
  const validate = (query) => leadsListQuerySchema.validate(query, { stripUnknown: true });

  it("applies defaults and converts the phone filter to a boolean", () => {
    const { value, error } = validate({ phoneRevealed: "false" });

    expect(error).toBeUndefined();
    expect(value).toMatchObject({ page: 1, limit: 10, phoneRevealed: false });
  });

  it("rejects unknown roles and oversized pages", () => {
    expect(validate({ role: "admin" }).error).toBeDefined();
    expect(validate({ limit: 500 }).error).toBeDefined();
  });
});

describe("leadIdParamSchema", () => {
  it("requires a uuid", () => {
    expect(leadIdParamSchema.validate({ id: "3f1c2a9e-5b7d-4c11-9a3e-2d6f8b0c1e44" }).error).toBeUndefined();
    expect(leadIdParamSchema.validate({ id: "lead-1" }).error).toBeDefined();
  });
});

describe("sendLeadToLister", () => {
  const sendable = {
    id: "lead-1",
    property_id: "prop-1",
    lister_user_id: "user-9",
    verification_status: "verified",
    distribution_status: "not_sent",
    property_title: "Sky Heights",
  };

  beforeEach(() => {
    repository.findLeadForUpdate.mockResolvedValue(sendable);
    repository.markLeadSent.mockResolvedValue({
      id: "lead-1",
      distribution_status: "sent",
      sent_at: "2026-11-18T10:00:00.000Z",
    });
    notificationRepository.insertNotification.mockResolvedValue();
    leadLimitService.assertSendCapacity.mockResolvedValue({ limit: null, received: 0 });
  });

  const expectRejected = async (statusCode) => {
    await expect(sendLeadToLister("lead-1")).rejects.toMatchObject({ statusCode });
    expect(notificationRepository.insertNotification).not.toHaveBeenCalled();
  };

  it("marks the lead sent and notifies the stored lister in the same transaction", async () => {
    const result = await sendLeadToLister("lead-1");

    expect(result).toEqual({ id: "lead-1", distributionStatus: "sent", sentAt: "2026-11-18T10:00:00.000Z" });
    expect(repository.markLeadSent).toHaveBeenCalledWith(mockTrx, "lead-1");
    expect(notificationRepository.insertNotification).toHaveBeenCalledWith(
      mockTrx,
      expect.objectContaining({
        user_id: "user-9",
        type: "lead_received",
        property_id: "prop-1",
        lead_id: "lead-1",
        title: "Sky Heights",
      })
    );
  });

  it("refuses to send once the property's free lead limit is used", async () => {
    leadLimitService.assertSendCapacity.mockRejectedValueOnce(Object.assign(new Error("limit"), { statusCode: 409 }));

    await expectRejected(409);
    expect(repository.markLeadSent).not.toHaveBeenCalled();
    expect(leadLimitService.notifyLeadProgress).not.toHaveBeenCalled();
  });

  it("reports the lead limit progress after the lead is sent", async () => {
    const progress = { limit: 2, received: 1 };
    leadLimitService.assertSendCapacity.mockResolvedValue(progress);

    await sendLeadToLister("lead-1");

    expect(leadLimitService.assertSendCapacity).toHaveBeenCalledWith(mockTrx, "prop-1", "lead-1");
    expect(leadLimitService.notifyLeadProgress).toHaveBeenCalledWith(
      mockTrx,
      { id: "prop-1", user_id: "user-9", title: "Sky Heights" },
      progress
    );
  });

  it("returns 404 for a missing lead", async () => {
    repository.findLeadForUpdate.mockResolvedValue(undefined);
    await expectRejected(404);
  });

  it("rejects a lead that is not verified", async () => {
    repository.findLeadForUpdate.mockResolvedValue({ ...sendable, verification_status: "not_verified" });
    await expectRejected(409);
  });

  it("rejects a lead that was already sent", async () => {
    repository.findLeadForUpdate.mockResolvedValue({ ...sendable, distribution_status: "sent" });
    await expectRejected(409);
  });

  it("rejects a lead with no user lister", async () => {
    repository.findLeadForUpdate.mockResolvedValue({ ...sendable, lister_user_id: null });
    await expectRejected(422);
  });

  it("creates no notification when a concurrent send already updated the lead", async () => {
    repository.markLeadSent.mockResolvedValue(undefined);
    await expectRejected(409);
  });
});
