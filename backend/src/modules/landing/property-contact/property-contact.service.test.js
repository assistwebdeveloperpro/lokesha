const mockTrx = {};

jest.mock("../../../config/db", () => ({ db: { transaction: (callback) => callback(mockTrx) } }));
jest.mock("./property-contact.repository");
jest.mock("../../shared/subscription/services/subscription-lead-limit.service");
jest.mock("../../master/dashboard/admin-notifications/admin-notifications.service");

const repository = require("./property-contact.repository");
const adminNotifications = require("../../master/dashboard/admin-notifications/admin-notifications.service");
const leadLimitService = require("../../shared/subscription/services/subscription-lead-limit.service");
const { contactLister, listContactedPropertyIds } = require("./property-contact.service");

const USER_ID = "user-1";
const input = { propertyId: "prop-1", contactRole: "owner" };

const userProperty = {
  id: "prop-1",
  user_id: "owner-1",
  admin_id: null,
  listed_by: "buyer_owner_tenant",
  user_name: "Asha",
  user_mobile: "9000000001",
  admin_name: null,
  admin_mobile: null,
};

const adminProperty = {
  id: "prop-2",
  user_id: null,
  admin_id: "admin-1",
  listed_by: "admin",
  user_name: null,
  user_mobile: null,
  admin_name: "Lokesha Admin",
  admin_mobile: "9000000009",
};

beforeEach(() => {
  jest.clearAllMocks();
  repository.findPublishedPropertyWithLister.mockResolvedValue(userProperty);
  repository.findUserById.mockResolvedValue({ id: USER_ID, name: "Ravi", email: "ravi@example.com", mobile_number: "9111111111" });
  repository.findLead.mockResolvedValue(undefined);
  repository.countRevealedLeads.mockResolvedValue(0);
  repository.insertLead.mockResolvedValue({});
  leadLimitService.assertLeadCapacity.mockResolvedValue({ limit: null, received: 0 });
});

describe("contactLister admin notification", () => {
  it("notifies admins about a new lead inside the transaction", async () => {
    repository.insertLead.mockResolvedValue({ id: "lead-1" });

    await contactLister(USER_ID, input);

    expect(adminNotifications.notifyLeadReceived).toHaveBeenCalledWith(mockTrx, {
      propertyId: "prop-1",
      leadId: "lead-1",
      leadName: "Ravi",
    });
  });

  it("does not notify again when the user already contacted the property", async () => {
    repository.findLead.mockResolvedValue({ id: "lead-1", phone_revealed: true, created_at: new Date() });

    await contactLister(USER_ID, input);

    expect(adminNotifications.notifyLeadReceived).not.toHaveBeenCalled();
  });
});

describe("contactLister lead limit", () => {
  it("checks the property's capacity inside the transaction and notifies after the lead is stored", async () => {
    const progress = { limit: 2, received: 1 };
    leadLimitService.assertLeadCapacity.mockResolvedValue(progress);

    await contactLister(USER_ID, input);

    expect(leadLimitService.assertLeadCapacity).toHaveBeenCalledWith(mockTrx, "prop-1");
    expect(leadLimitService.notifyLeadProgress).toHaveBeenCalledWith(mockTrx, userProperty, progress);
    expect(repository.insertLead.mock.invocationCallOrder[0]).toBeLessThan(
      leadLimitService.notifyLeadProgress.mock.invocationCallOrder[0]
    );
  });

  it("stores no lead and uses no phone credit when the property is full", async () => {
    leadLimitService.assertLeadCapacity.mockRejectedValueOnce(Object.assign(new Error("full"), { statusCode: 409 }));

    await expect(contactLister(USER_ID, input)).rejects.toMatchObject({ statusCode: 409 });
    expect(repository.insertLead).not.toHaveBeenCalled();
    expect(leadLimitService.notifyLeadProgress).not.toHaveBeenCalled();
  });

  it("still answers a seeker who already contacted a full property", async () => {
    repository.findLead.mockResolvedValue({ created_at: new Date(), phone_revealed: true });

    await expect(contactLister(USER_ID, input)).resolves.toMatchObject({ phoneRevealed: true });
    expect(leadLimitService.assertLeadCapacity).not.toHaveBeenCalled();
  });
});

describe("contactLister quota", () => {
  it("reveals the phone on the first contact with 1 credit left", async () => {
    const result = await contactLister(USER_ID, input);

    expect(result).toEqual({
      contactName: "Asha",
      contactPhone: "9000000001",
      phoneRevealed: true,
      creditBalance: 1,
      canSubscribe: false,
    });
    expect(repository.insertLead).toHaveBeenCalledWith(
      expect.objectContaining({ phone_revealed: true, lead_user_id: USER_ID, lister_user_id: "owner-1", lister_role: "owner" }),
      mockTrx
    );
  });

  it("reveals the phone on the second contact with 0 credits left", async () => {
    repository.countRevealedLeads.mockResolvedValue(1);

    const result = await contactLister(USER_ID, input);

    expect(result).toMatchObject({ phoneRevealed: true, creditBalance: 0 });
  });

  it("hides the phone from the third contact but still stores the lead", async () => {
    repository.countRevealedLeads.mockResolvedValue(2);

    const result = await contactLister(USER_ID, input);

    expect(result).toEqual({
      contactName: "Asha",
      contactPhone: null,
      phoneRevealed: false,
      creditBalance: 0,
      canSubscribe: true,
    });
    expect(repository.insertLead).toHaveBeenCalledWith(expect.objectContaining({ phone_revealed: false }), mockTrx);
  });
});

describe("contactLister staff listed quota", () => {
  it.each([["admin", adminProperty], ["lokesha_staff", { ...userProperty, listed_by: "lokesha_staff" }]])(
    "hides the phone over quota for a %s listed property",
    async (_listedBy, property) => {
      repository.findPublishedPropertyWithLister.mockResolvedValue(property);
      repository.countRevealedLeads.mockResolvedValue(2);

      const result = await contactLister(USER_ID, input);

      expect(result).toMatchObject({ contactPhone: null, phoneRevealed: false, canSubscribe: true });
      expect(repository.insertLead).toHaveBeenCalledWith(expect.objectContaining({ phone_revealed: false }), mockTrx);
    }
  );

  it("does not reveal an earlier over-quota staff lead on a repeat contact", async () => {
    repository.findPublishedPropertyWithLister.mockResolvedValue(adminProperty);
    repository.findLead.mockResolvedValue({ phone_revealed: false, created_at: new Date() });
    repository.countRevealedLeads.mockResolvedValue(2);

    const result = await contactLister(USER_ID, input);

    expect(result).toMatchObject({ contactPhone: null, canSubscribe: true });
  });
});

describe("contactLister idempotency", () => {
  it("returns the earlier result without inserting or using a credit", async () => {
    repository.findLead.mockResolvedValue({ phone_revealed: true, created_at: new Date() });
    repository.countRevealedLeads.mockResolvedValue(0);

    const result = await contactLister(USER_ID, input);

    expect(result).toMatchObject({ contactPhone: "9000000001", creditBalance: 1 });
    expect(repository.insertLead).not.toHaveBeenCalled();
  });

  it("keeps the phone hidden for an earlier lead that was over quota", async () => {
    repository.findLead.mockResolvedValue({ phone_revealed: false, created_at: new Date() });
    repository.countRevealedLeads.mockResolvedValue(2);

    const result = await contactLister(USER_ID, input);

    expect(result).toMatchObject({ contactPhone: null, canSubscribe: true });
    expect(repository.insertLead).not.toHaveBeenCalled();
  });
});

describe("contactLister lister resolution", () => {
  it("uses the admin number for an admin listed property", async () => {
    repository.findPublishedPropertyWithLister.mockResolvedValue(adminProperty);

    const result = await contactLister(USER_ID, input);

    expect(result).toMatchObject({ contactName: "Lokesha Admin", contactPhone: "9000000009" });
    expect(repository.insertLead).toHaveBeenCalledWith(
      expect.objectContaining({ lister_user_id: null, lister_admin_id: "admin-1", lister_listed_by: "admin" }),
      mockTrx
    );
  });

  it("uses the staff number for a staff listed property", async () => {
    repository.findPublishedPropertyWithLister.mockResolvedValue({
      ...userProperty,
      user_id: "staff-1",
      listed_by: "lokesha_staff",
      user_name: "Staff Member",
      user_mobile: "9000000005",
    });

    const result = await contactLister(USER_ID, input);

    expect(result).toMatchObject({ contactName: "Staff Member", contactPhone: "9000000005" });
  });

  it("shows the real owner name with the lister's number for a staff listed property", async () => {
    repository.findPublishedPropertyWithLister.mockResolvedValue({
      ...adminProperty,
      owner_name: "Real Owner",
      owner_mobile: "9222222222",
    });

    const result = await contactLister(USER_ID, input);

    expect(result).toMatchObject({ contactName: "Real Owner", contactPhone: "9000000009" });
    expect(repository.insertLead).toHaveBeenCalledWith(
      expect.objectContaining({ lister_name: "Real Owner", lister_mobile: "9222222222" }),
      expect.anything()
    );
  });
});

describe("listContactedPropertyIds", () => {
  it("returns the ids of properties the user has contacted", async () => {
    repository.findContactedPropertyIds.mockResolvedValue(["prop-1", "prop-2"]);

    const result = await listContactedPropertyIds(USER_ID);

    expect(result).toEqual({ propertyIds: ["prop-1", "prop-2"] });
    expect(repository.findContactedPropertyIds).toHaveBeenCalledWith(USER_ID);
  });

  it("returns an empty list when the user has not contacted anyone", async () => {
    repository.findContactedPropertyIds.mockResolvedValue([]);

    await expect(listContactedPropertyIds(USER_ID)).resolves.toEqual({ propertyIds: [] });
  });
});

describe("contactLister rejections", () => {
  it("returns 404 when the property is missing or unpublished", async () => {
    repository.findPublishedPropertyWithLister.mockResolvedValue(undefined);

    await expect(contactLister(USER_ID, input)).rejects.toMatchObject({ statusCode: 404 });
    expect(repository.insertLead).not.toHaveBeenCalled();
  });

  it("returns 400 when the requester is the lister", async () => {
    repository.findPublishedPropertyWithLister.mockResolvedValue({ ...userProperty, user_id: USER_ID });

    await expect(contactLister(USER_ID, input)).rejects.toMatchObject({ statusCode: 400 });
    expect(repository.insertLead).not.toHaveBeenCalled();
  });
});
