const { searchQuerySchema, addProjectsSchema, reorderSchema, projectIdParamSchema } = require("./limelight-projects.validation");

const ID_1 = "3f2b8c1e-5a4d-4e6f-8a1b-2c3d4e5f6a7b";
const ID_2 = "9a8b7c6d-5e4f-4a3b-9c2d-1e0f9a8b7c6d";

describe("searchQuerySchema", () => {
  it("defaults the paging", () => {
    expect(searchQuerySchema.validate({}).value).toEqual({ page: 1, limit: 12 });
  });

  it("trims text and converts numbers", () => {
    const { error, value } = searchQuerySchema.validate({
      keyword: "  shyam ",
      bhk: "3",
      priceMin: "100",
      priceMax: "200",
      listedBy: "lokesha_staff",
      propertyType: "pg-co-living",
      possessionStatus: "ready-to-move",
    });

    expect(error).toBeUndefined();
    expect(value).toMatchObject({ keyword: "shyam", bhk: 3, priceMin: 100, priceMax: 200 });
  });

  it.each([
    [{ priceMin: "200", priceMax: "100" }],
    [{ priceMax: "-1" }],
    [{ listedBy: "agent" }],
    [{ propertyType: "pg" }],
    [{ possessionStatus: "unknown" }],
    [{ limit: "51" }],
    [{ bhk: "0" }],
  ])("rejects %p", (query) => {
    expect(searchQuerySchema.validate(query).error).toBeDefined();
  });
});

describe.each([
  ["addProjectsSchema", addProjectsSchema],
  ["reorderSchema", reorderSchema],
])("%s", (_name, schema) => {
  it("accepts a list of project ids", () => {
    expect(schema.validate({ projectIds: [ID_1, ID_2] }).error).toBeUndefined();
  });

  it.each([
    [{}],
    [{ projectIds: [] }],
    [{ projectIds: ["not-a-uuid"] }],
    [{ projectIds: [ID_1, ID_1] }],
    [{ projectIds: Array.from({ length: 101 }, (_, index) => `${ID_1.slice(0, -3)}${String(index).padStart(3, "0")}`) }],
  ])("rejects %p", (body) => {
    expect(schema.validate(body).error).toBeDefined();
  });
});

describe("projectIdParamSchema", () => {
  it("requires a uuid", () => {
    expect(projectIdParamSchema.validate({ projectId: ID_1 }).error).toBeUndefined();
    expect(projectIdParamSchema.validate({ projectId: "1" }).error).toBeDefined();
  });
});
