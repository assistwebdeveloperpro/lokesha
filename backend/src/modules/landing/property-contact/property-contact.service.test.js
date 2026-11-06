const mockTrx = {};

jest.mock("../../../config/db", () => ({ db: { transaction: (callback) => callback(mockTrx) } }));
jest.mock("./property-contact.repository");

const repository = require("./property-contact.repository");
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
