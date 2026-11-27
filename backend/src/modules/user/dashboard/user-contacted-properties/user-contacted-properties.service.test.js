jest.mock("../../../../config/db", () => ({ db: {} }));
jest.mock("./user-contacted-properties.repository");
jest.mock("../../../landing/property-search/property-search.repository");
jest.mock("../../../landing/property-search/property-search.mapper", () => ({
  FORM_TYPE_BY_DB_TYPE: { residential: "residential" },
  toListing: jest.fn((card) => ({ id: card.id, title: card.title })),
}));

const repository = require("./user-contacted-properties.repository");
const searchRepository = require("../../../landing/property-search/property-search.repository");
const { listContactedProperties } = require("./user-contacted-properties.service");

const HOUR_MS = 60 * 60 * 1000;
const query = { page: 1, limit: 10, availability: "all" };
const summary = { total: 2, available: 1, phonesRevealed: 1, recent: 2 };

const buildLead = (overrides = {}) => ({
  id: "lead-1",
  property_id: "p1",
  lister_role: "owner",
  phone_revealed: true,
  lister_name: "Asha",
  lister_mobile: "9999999999",
  lister_listed_by: "owner",
  created_at: new Date(Date.now() - HOUR_MS),
  status: "published",
  title: "2 BHK Flat",
  listing_number: "100001",
  listing_type: "sale",
  property_type: "residential",
  locality: "Indiranagar",
  city: "Bengaluru",
  ...overrides,
});

function mockRepositories(leads) {
  repository.findContactedLeads.mockResolvedValue(leads);
  repository.countContactedLeads.mockResolvedValue(leads.length);
  repository.countContactedSummary.mockResolvedValue(summary);
  searchRepository.findCardsByPropertyIds.mockResolvedValue([{ id: "p1", title: "Sky Heights", member_ids: ["p1", "p1b"] }]);
  searchRepository.findCardsOfPropertyIds.mockResolvedValue([{ id: "p1", title: "Sky Heights", member_ids: ["p1", "p1b"] }]);
  searchRepository.findCardExtras.mockResolvedValue({ media: [], variants: [], reraRows: [] });
}

describe("listContactedProperties", () => {
  beforeEach(() => jest.clearAllMocks());

  it("maps a published lead to its search card and returns the page and summary", async () => {
    mockRepositories([buildLead()]);

    const result = await listContactedProperties("user-1", query);

    expect(searchRepository.findCardsByPropertyIds).toHaveBeenCalledWith(["p1"], "residential");
    expect(result).toMatchObject({
      page: 1,
      limit: 10,
      total: 1,
      summary: { total: 2, available: 1, phonesRevealed: 1, thisWeek: 2 },
    });
    expect(result.items[0]).toMatchObject({
      id: "lead-1",
      isAvailable: true,
      isNew: true,
      property: { id: "p1", title: "Sky Heights" },
    });
  });

  it("hides the lister phone when it was never revealed", async () => {
    mockRepositories([buildLead({ phone_revealed: false })]);

    const [item] = (await listContactedProperties("user-1", query)).items;

    expect(item.phoneRevealed).toBe(false);
    expect(item.lister).toEqual({ name: "Asha", mobile: null, listedBy: "owner" });
  });

  it("keeps unavailable properties readable with their own title and number", async () => {
    mockRepositories([buildLead({ status: "closed" })]);

    const [item] = (await listContactedProperties("user-1", query)).items;

    expect(searchRepository.findCardsByPropertyIds).not.toHaveBeenCalled();
    expect(searchRepository.findCardsOfPropertyIds).toHaveBeenCalledWith(["p1"], "residential");
    expect(item.isAvailable).toBe(false);
    expect(item.property).toEqual({
      id: "p1",
      title: "2 BHK Flat",
      listingNumber: "100001",
      listingType: "sale",
      propertyType: "residential",
      locality: "Indiranagar",
      city: "Bengaluru",
    });
  });

  it("falls back to the lead's own property fields when an unavailable card is gone", async () => {
    mockRepositories([buildLead({ status: "closed" })]);
    searchRepository.findCardsOfPropertyIds.mockResolvedValue([]);

    const [item] = (await listContactedProperties("user-1", query)).items;

    expect(item.property).toMatchObject({ id: "p1", title: "2 BHK Flat", listingNumber: "100001" });
  });

  it("flags only contacts from the last 48 hours as new", async () => {
    mockRepositories([buildLead({ created_at: new Date(Date.now() - 72 * HOUR_MS) })]);

    const [item] = (await listContactedProperties("user-1", query)).items;

    expect(item.isNew).toBe(false);
  });
});
