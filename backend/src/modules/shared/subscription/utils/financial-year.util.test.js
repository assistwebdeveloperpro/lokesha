const { getFinancialYear, formatInvoiceNumber } = require("./financial-year.util");

describe("getFinancialYear", () => {
  it("keeps March in the previous financial year and starts a new one on 1 April IST", () => {
    expect(getFinancialYear(new Date("2027-03-31T12:00:00.000Z"))).toBe("2026-27");
    expect(getFinancialYear(new Date("2027-04-01T12:00:00.000Z"))).toBe("2027-28");
  });

  it("uses IST for the boundary", () => {
    // 31 Mar 18:30 UTC is already 1 Apr 00:00 IST
    expect(getFinancialYear(new Date("2027-03-31T18:29:59.999Z"))).toBe("2026-27");
    expect(getFinancialYear(new Date("2027-03-31T18:30:00.000Z"))).toBe("2027-28");
  });

  it("pads the short year and handles the century change", () => {
    expect(getFinancialYear(new Date("2008-06-01T00:00:00.000Z"))).toBe("2008-09");
    expect(getFinancialYear(new Date("2099-06-01T00:00:00.000Z"))).toBe("2099-00");
  });

  it("covers the January to March months", () => {
    expect(getFinancialYear(new Date("2026-01-15T00:00:00.000Z"))).toBe("2025-26");
  });
});

describe("formatInvoiceNumber", () => {
  it("pads the sequence to six digits", () => {
    expect(formatInvoiceNumber({ prefix: "LOK", financialYear: "2026-27", sequence: 123 })).toBe("LOK/2026-27/000123");
    expect(formatInvoiceNumber({ prefix: "LOK-CN", financialYear: "2026-27", sequence: 1 })).toBe("LOK-CN/2026-27/000001");
  });

  it("does not truncate larger sequences", () => {
    expect(formatInvoiceNumber({ prefix: "LOK", financialYear: "2026-27", sequence: 1234567 })).toBe("LOK/2026-27/1234567");
  });

  it("rejects an invalid sequence", () => {
    expect(() => formatInvoiceNumber({ prefix: "LOK", financialYear: "2026-27", sequence: 0 })).toThrow(RangeError);
  });
});
