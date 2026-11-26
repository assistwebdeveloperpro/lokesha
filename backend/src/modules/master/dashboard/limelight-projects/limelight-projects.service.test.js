jest.mock("./limelight-projects.repository");
jest.mock("../../../shared/property/repositories/property-read.repository");
jest.mock("../../../landing/limelight-projects/limelight-projects.service");
jest.mock("../../../landing/property-search/property-search.repository");
jest.mock("../../../landing/property-search/property-search.mapper");

const repository = require("./limelight-projects.repository");
const readRepository = require("../../../shared/property/repositories/property-read.repository");
const landingService = require("../../../landing/limelight-projects/limelight-projects.service");
const searchRepository = require("../../../landing/property-search/property-search.repository");
const searchMapper = require("../../../landing/property-search/property-search.mapper");
const { searchProjects, listEntries, addProjects, removeProject, saveOrder } = require("./limelight-projects.service");

const searchRow = {
  project_id: "bp-1",
  project_name: "Shyam Kutir 86",
  developer_name: "Shyam Group",
  locality: "Hathijan",
  city: "Ahmedabad",
  price_min: "7500000.00",
  price_max: "25000000.00",
  listing_number: "100010",
  member_ids: ["p-1"],
  already_added: false,
};

const detailsSource = {
  id: "p-1",
  bedrooms: [3],
  carpetArea: 1200,
  carpetAreaUnit: "sq-ft",
  propertySubType: "apartment",
  propertyType: "residential",
  listingType: "sale",
  locality: "Hathijan",
  city: "Ahmedabad",
};

beforeEach(() => {
  landingService.findCardsByProject.mockResolvedValue(new Map([["bp-1", { member_ids: ["p-1"] }]]));
  searchRepository.findCardExtras.mockResolvedValue([]);
  searchMapper.toListing.mockReturnValue({ ...detailsSource, carpetAreaMin: 1200, extra: "ignored" });
  readRepository.findImagesByPropertyIds.mockResolvedValue([
    { property_id: "p-1", category: "gallery", file_path: "/uploads/a.jpg" },
    { property_id: "p-1", category: "main-photo", file_path: "/uploads/main.jpg" },
  ]);
});

describe("searchProjects", () => {
  it("maps rows into project cards with the main photo", async () => {
    repository.findEligibleProjects.mockResolvedValue([searchRow]);
    repository.countEligibleProjects.mockResolvedValue(1);

    const result = await searchProjects({ page: 1, limit: 12 });

    expect(result).toEqual({
      items: [
        {
          projectId: "bp-1",
          projectName: "Shyam Kutir 86",
          builderName: "Shyam Group",
          locality: "Hathijan",
          city: "Ahmedabad",
          priceMin: 7500000,
          priceMax: 25000000,
          mainImage: "/uploads/main.jpg",
          listingNumber: 100010,
          detailsSource,
          alreadyAdded: false,
        },
      ],
      page: 1,
      limit: 12,
      total: 1,
    });
  });

  it("turns the form property type into the stored one and pages the query", async () => {
    repository.findEligibleProjects.mockResolvedValue([]);
    repository.countEligibleProjects.mockResolvedValue(0);

    await searchProjects({ page: 3, limit: 10, propertyType: "pg-co-living", keyword: "shyam" });

    expect(repository.findEligibleProjects).toHaveBeenCalledWith(
      { keyword: "shyam", propertyType: "pg" },
      { limit: 10, offset: 20 }
    );
    expect(repository.countEligibleProjects).toHaveBeenCalledWith({ keyword: "shyam", propertyType: "pg" });
  });

  it("flags a project that is already in Limelight", async () => {
    repository.findEligibleProjects.mockResolvedValue([{ ...searchRow, already_added: true }]);
    repository.countEligibleProjects.mockResolvedValue(1);

    const { items } = await searchProjects({ page: 1, limit: 12 });

    expect(items[0].alreadyAdded).toBe(true);
  });
});

describe("listEntries", () => {
  it("numbers the entries in order and reports whether each is visible", async () => {
    repository.findEntries.mockResolvedValue([
      { ...searchRow, project_id: "bp-1", is_visible: true },
      { ...searchRow, project_id: "bp-2", is_visible: false, price_min: null, price_max: null, member_ids: null },
    ]);

    const result = await listEntries();

    expect(result.total).toBe(2);
    expect(result.items.map(({ projectId, position, isVisible }) => [projectId, position, isVisible])).toEqual([
      ["bp-1", 1, true],
      ["bp-2", 2, false],
    ]);
    expect(result.items[1]).toMatchObject({ priceMin: null, priceMax: null, mainImage: null });
  });
});

describe("addProjects", () => {
  it("adds eligible projects and reports how many were new", async () => {
    repository.findEligibleProjectIds.mockResolvedValue(["bp-1", "bp-2"]);
    repository.insertEntries.mockResolvedValue(["bp-1"]);

    await expect(addProjects(["bp-1", "bp-2"], "admin-1")).resolves.toEqual({ added: 1, skipped: 1 });
    expect(repository.insertEntries).toHaveBeenCalledWith(["bp-1", "bp-2"], "admin-1");
  });

  it("rejects the whole request when one project is not an eligible builder project", async () => {
    repository.findEligibleProjectIds.mockResolvedValue(["bp-1"]);

    await expect(addProjects(["bp-1", "bp-2"], "admin-1")).rejects.toMatchObject({ statusCode: 400 });
    expect(repository.insertEntries).not.toHaveBeenCalled();
  });
});

describe("removeProject", () => {
  it("removes a featured project", async () => {
    repository.deleteEntry.mockResolvedValue(1);

    await expect(removeProject("bp-1")).resolves.toBeUndefined();
  });

  it("returns 404 for a project that is not featured", async () => {
    repository.deleteEntry.mockResolvedValue(0);

    await expect(removeProject("bp-1")).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("saveOrder", () => {
  it("saves the order", async () => {
    repository.replaceOrder.mockResolvedValue(true);

    await expect(saveOrder(["bp-2", "bp-1"])).resolves.toBeUndefined();
    expect(repository.replaceOrder).toHaveBeenCalledWith(["bp-2", "bp-1"]);
  });

  it("returns 409 when the featured projects changed meanwhile", async () => {
    repository.replaceOrder.mockResolvedValue(false);

    await expect(saveOrder(["bp-2"])).rejects.toMatchObject({ statusCode: 409 });
  });
});
