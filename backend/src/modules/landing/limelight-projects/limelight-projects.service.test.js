jest.mock("./limelight-projects.repository");
jest.mock("../property-search/property-search.repository");
jest.mock("../property-search/property-search.mapper");

const repository = require("./limelight-projects.repository");
const searchRepository = require("../property-search/property-search.repository");
const mapper = require("../property-search/property-search.mapper");
const { listLimelightProjects } = require("./limelight-projects.service");

const card = (projectId, memberId) => ({ builder_project_id: projectId, member_ids: [memberId] });

beforeEach(() => {
  mapper.toListing.mockImplementation((row) => ({ id: row.member_ids[0] }));
  searchRepository.findCardExtras.mockResolvedValue({ media: [], variants: [], reraRows: [] });
});

describe("listLimelightProjects", () => {
  it("keeps the admin order whatever order the cards come back in", async () => {
    repository.countVisibleEntries.mockResolvedValue(2);
    repository.findVisibleEntries.mockResolvedValue([
      { builder_project_id: "bp-2", project_area_acres: "4.50" },
      { builder_project_id: "bp-1", project_area_acres: null },
    ]);
    repository.findRepresentativeProperties.mockResolvedValue([
      { id: "p-1", property_type: "residential", builder_project_id: "bp-1" },
      { id: "p-2", property_type: "residential", builder_project_id: "bp-2" },
    ]);
    searchRepository.findCardsByPropertyIds.mockResolvedValue([card("bp-1", "p-1"), card("bp-2", "p-2")]);

    const result = await listLimelightProjects({ page: 1, pageSize: 30 });

    expect(result.items).toEqual([
      { id: "p-2", projectAreaAcres: 4.5 },
      { id: "p-1", projectAreaAcres: null },
    ]);
    expect(result).toMatchObject({ page: 1, pageSize: 30, total: 2 });
  });

  it("builds the cards once per property type", async () => {
    repository.countVisibleEntries.mockResolvedValue(2);
    repository.findVisibleEntries.mockResolvedValue([
      { builder_project_id: "bp-1", project_area_acres: null },
      { builder_project_id: "bp-2", project_area_acres: null },
    ]);
    repository.findRepresentativeProperties.mockResolvedValue([
      { id: "p-1", property_type: "residential", builder_project_id: "bp-1" },
      { id: "p-2", property_type: "plot", builder_project_id: "bp-2" },
    ]);
    searchRepository.findCardsByPropertyIds.mockImplementation(async (ids) =>
      ids.map((id) => card(id === "p-1" ? "bp-1" : "bp-2", id))
    );

    await listLimelightProjects({ page: 1, pageSize: 30 });

    expect(searchRepository.findCardsByPropertyIds).toHaveBeenCalledWith(["p-1"], "residential");
    expect(searchRepository.findCardsByPropertyIds).toHaveBeenCalledWith(["p-2"], "plot");
  });

  it("skips a project whose card could not be built", async () => {
    repository.countVisibleEntries.mockResolvedValue(2);
    repository.findVisibleEntries.mockResolvedValue([
      { builder_project_id: "bp-1", project_area_acres: null },
      { builder_project_id: "bp-2", project_area_acres: null },
    ]);
    repository.findRepresentativeProperties.mockResolvedValue([
      { id: "p-2", property_type: "residential", builder_project_id: "bp-2" },
    ]);
    searchRepository.findCardsByPropertyIds.mockResolvedValue([card("bp-2", "p-2")]);

    const { items } = await listLimelightProjects({ page: 1, pageSize: 30 });

    expect(items.map(({ id }) => id)).toEqual(["p-2"]);
  });

  it("uses the first card when a project has several listing groups", async () => {
    repository.countVisibleEntries.mockResolvedValue(1);
    repository.findVisibleEntries.mockResolvedValue([{ builder_project_id: "bp-1", project_area_acres: null }]);
    repository.findRepresentativeProperties.mockResolvedValue([
      { id: "p-1", property_type: "residential", builder_project_id: "bp-1" },
    ]);
    searchRepository.findCardsByPropertyIds.mockResolvedValue([card("bp-1", "p-1"), card("bp-1", "p-9")]);

    const { items } = await listLimelightProjects({ page: 1, pageSize: 30 });

    expect(items.map(({ id }) => id)).toEqual(["p-1"]);
  });

  it("returns an empty page without loading any card", async () => {
    repository.countVisibleEntries.mockResolvedValue(0);
    repository.findVisibleEntries.mockResolvedValue([]);
    repository.findRepresentativeProperties.mockResolvedValue([]);

    const result = await listLimelightProjects({ page: 1, pageSize: 30 });

    expect(result.items).toEqual([]);
    expect(searchRepository.findCardsByPropertyIds).not.toHaveBeenCalled();
  });

  it("asks the repository for the requested page", async () => {
    repository.countVisibleEntries.mockResolvedValue(0);
    repository.findVisibleEntries.mockResolvedValue([]);
    repository.findRepresentativeProperties.mockResolvedValue([]);

    await listLimelightProjects({ page: 3, pageSize: 10 });

    expect(repository.findVisibleEntries).toHaveBeenCalledWith(
      { limit: 10, offset: 20 },
      { listingType: undefined, category: undefined, city: undefined }
    );
  });
});
