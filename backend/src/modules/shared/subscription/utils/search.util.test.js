const { escapeIlikePattern, toContainsPattern } = require("./search.util");

describe("search helpers", () => {
  it("escapes wildcard characters and the escape character", () => {
    expect(escapeIlikePattern("50%_off\\")).toBe("50\\%\\_off\\\\");
    expect(escapeIlikePattern("Asha Rao")).toBe("Asha Rao");
  });

  it("wraps the escaped text for a contains search", () => {
    expect(toContainsPattern("a_b")).toBe("%a\\_b%");
  });
});
