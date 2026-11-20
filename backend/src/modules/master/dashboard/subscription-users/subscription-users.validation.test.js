const { usersListQuerySchema } = require("./subscription-users.validation");

describe("usersListQuerySchema", () => {
  it("defaults to the first page of ten", () => {
    expect(usersListQuerySchema.validate({}).value).toEqual({ page: 1, limit: 10 });
  });

  it("accepts a search, a package and a status", () => {
    const { error, value } = usersListQuerySchema.validate({ search: "  Asha ", package: "standard", status: "active", page: "2" });

    expect(error).toBeUndefined();
    expect(value).toEqual({ page: 2, limit: 10, search: "Asha", package: "standard", status: "active" });
  });

  it.each([
    [{ package: "gold" }],
    [{ status: "paused" }],
    [{ limit: 51 }],
    [{ page: 0 }],
    [{ search: "x".repeat(101) }],
  ])("rejects %j", (query) => {
    expect(usersListQuerySchema.validate(query).error).toBeDefined();
  });
});
