const { listQuerySchema } = require("./limelight-projects.validation");

describe("listQuerySchema", () => {
  it("defaults the page and the page size", () => {
    const { error, value } = listQuerySchema.validate({});

    expect(error).toBeUndefined();
    expect(value).toEqual({ page: 1, pageSize: 30 });
  });

  it("converts query strings to numbers", () => {
    expect(listQuerySchema.validate({ page: "2", pageSize: "50" }).value).toEqual({ page: 2, pageSize: 50 });
  });

  it.each([{ page: "0" }, { pageSize: "51" }, { pageSize: "0" }])("rejects %p", (query) => {
    expect(listQuerySchema.validate(query).error).toBeDefined();
  });
});
