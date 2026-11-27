jest.mock("../../../../config/db", () => ({ db: {} }));
jest.mock("./user-leads.repository");
jest.mock("../../../landing/property-search/property-search.repository");
jest.mock("../../../landing/property-search/property-search.mapper", () => ({
  FORM_TYPE_BY_DB_TYPE: { residential: "residential" },
  toListing: jest.fn((card) => ({ id: card.id, title: card.title })),
}));

const repository = require("./user-leads.repository");
const searchRepository = require("../../../landing/property-search/property-search.repository");
const { listLeads } = require("./user-leads.service");

const USER_ID = "user-1";
const HOUR_MS = 60 * 60 * 1000;
const query = { page: 2, limit: 5 };

const buildLead = (overrides = {}) => ({
  id: "lead-1",
  property_id: "p1",
  lister_role: "owner",
  phone_revealed: true,
  lead_name: "Ravi",
  lead_mobile: "9111111111",
  lead_email: "ravi@example.com",
  sent_at: new Date(Date.now() - HOUR_MS),
  created_at: "2026-11-17T09:00:00.000Z",
  status: "published",
  title: "2 BHK Flat",
  listing_number: "100001",
  listing_type: "sale",
  property_type: "residential",
  locality: "Bopal",
  city: "Ahmedabad",
  ...overrides,
});

function mockRepositories(leads, total = leads.length) {
  repository.findSentLeads.mockResolvedValue(leads);
  repository.countSentLeads.mockResolvedValue(total);
  searchRepository.findCardsByPropertyIds.mockResolvedValue([{ id: "p1", title: "Sky Heights", member_ids: ["p1"] }]);
  searchRepository.findCardsOfPropertyIds.mockResolvedValue([{ id: "p1", title: "Sky Heights", member_ids: ["p1"] }]);
  searchRepository.findCardExtras.mockResolvedValue({ media: [], variants: [], reraRows: [] });
}

describe("listLeads", () => {
  beforeEach(() => jest.clearAllMocks());

  it("maps a sent lead with the enquirer details and the property card", async () => {
    const lead = buildLead();
    mockRepositories([lead], 11);

    const result = await listLeads(USER_ID, query);

    expect(result).toMatchObject({ page: 2, limit: 5, total: 11 });
    expect(result.items[0]).toEqual({
      id: "lead-1",
      sentAt: lead.sent_at,
      isNew: true,
      enquiryDate: "2026-11-17T09:00:00.000Z",
      enquirer: { name: "Ravi", mobile: "9111111111", email: "ravi@example.com" },
      phoneRevealed: true,
      contactRole: "owner",
      isAvailable: true,
      property: { id: "p1", title: "Sky Heights" },
    });
  });

  it("flags only recently sent leads as new", async () => {
    mockRepositories([buildLead({ sent_at: new Date(Date.now() - 72 * HOUR_MS) })]);

    const [item] = (await listLeads(USER_ID, query)).items;

    expect(item.isNew).toBe(false);
  });

  it("only queries leads of the calling user", async () => {
    mockRepositories([]);

    await listLeads(USER_ID, query);

    expect(repository.findSentLeads).toHaveBeenCalledWith(USER_ID, { page: 2, limit: 5 });
    expect(repository.countSentLeads).toHaveBeenCalledWith(USER_ID);
  });

  it("keeps unavailable properties readable with their own title and number", async () => {
    mockRepositories([buildLead({ status: "closed" })]);

    const [item] = (await listLeads(USER_ID, query)).items;

    expect(searchRepository.findCardsByPropertyIds).not.toHaveBeenCalled();
    expect(searchRepository.findCardsOfPropertyIds).toHaveBeenCalledWith(["p1"], "residential");
    expect(item.isAvailable).toBe(false);
    expect(item.property).toEqual({
      id: "p1",
      title: "2 BHK Flat",
      listingNumber: "100001",
      listingType: "sale",
      propertyType: "residential",
      locality: "Bopal",
      city: "Ahmedabad",
    });
  });

  it("falls back to the lead's own property fields when an unavailable card is gone", async () => {
    mockRepositories([buildLead({ status: "closed" })]);
    searchRepository.findCardsOfPropertyIds.mockResolvedValue([]);

    const [item] = (await listLeads(USER_ID, query)).items;

    expect(item.property).toMatchObject({ id: "p1", title: "2 BHK Flat", listingNumber: "100001" });
  });

  describe("when a lead is requested", () => {
    it("returns the page that holds the lead", async () => {
      mockRepositories([buildLead()], 30);
      repository.countLeadsBefore.mockResolvedValue(12);

      const result = await listLeads(USER_ID, { page: 1, limit: 5, leadId: "lead-1" });

      expect(repository.countLeadsBefore).toHaveBeenCalledWith(USER_ID, "lead-1");
      expect(repository.findSentLeads).toHaveBeenCalledWith(USER_ID, { page: 3, limit: 5 });
      expect(result.page).toBe(3);
    });

    it("keeps the first page when the lead is the newest", async () => {
      mockRepositories([buildLead()]);
      repository.countLeadsBefore.mockResolvedValue(0);

      expect((await listLeads(USER_ID, { page: 1, limit: 5, leadId: "lead-1" })).page).toBe(1);
    });

    it("keeps the requested page when the lead does not belong to the user", async () => {
      mockRepositories([buildLead()]);
      repository.countLeadsBefore.mockResolvedValue(null);

      expect((await listLeads(USER_ID, { page: 2, limit: 5, leadId: "lead-9" })).page).toBe(2);
    });
  });
});
