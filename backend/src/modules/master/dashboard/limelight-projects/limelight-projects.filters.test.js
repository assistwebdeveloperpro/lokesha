const { buildConditions, havingAllConditions } = require("./limelight-projects.filters");

describe("buildConditions", () => {
  it("builds nothing without filters", () => {
    expect(buildConditions({})).toEqual([]);
  });

  it("escapes wildcards in text filters", () => {
    const [condition] = buildConditions({ city: "a_b%" });

    expect(condition.bindings).toEqual(["%a\\_b\\%%"]);
  });

  it("matches the keyword against project, builder and listing number", () => {
    const [condition] = buildConditions({ keyword: "shyam" });

    expect(condition.bindings).toEqual(["%shyam%", "%shyam%", "%shyam%"]);
    expect(condition.sql).toContain("p.listing_number::text");
  });

  it("maps Lokesha staff to both staff roles", () => {
    const [condition] = buildConditions({ listedBy: "lokesha_staff" });

    expect(condition.bindings).toEqual(["lokesha_staff", "admin"]);
  });

  it("builds one condition per filter that is set", () => {
    const conditions = buildConditions({ city: "Ahmedabad", bhk: 3, priceMin: 0, priceMax: 5 });

    expect(conditions).toHaveLength(4);
  });
});

describe("havingAllConditions", () => {
  it("requires every condition through bool_or so filters may match different properties", () => {
    const query = { havingRaw: jest.fn() };

    havingAllConditions(query, { city: "Ahmedabad", propertyType: "plot" });

    expect(query.havingRaw).toHaveBeenCalledTimes(2);
    expect(query.havingRaw).toHaveBeenCalledWith("bool_or(p.city ilike ?)", ["%Ahmedabad%"]);
    expect(query.havingRaw).toHaveBeenCalledWith("bool_or(p.property_type = ?)", ["plot"]);
  });
});
