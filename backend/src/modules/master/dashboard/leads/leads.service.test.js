jest.mock("./leads.repository");

const repository = require("./leads.repository");
const { leadsListQuerySchema } = require("./leads.validation");
const { listLeads } = require("./leads.service");

const row = {
  id: "lead-1",
  lister_role: "agent",
  phone_revealed: false,
  verification_status: "not_verified",
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
    });
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
