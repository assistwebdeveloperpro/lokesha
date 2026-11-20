const {
  addMonths,
  addDays,
  daysRemaining,
  isExpired,
  formatIstDate,
  formatIstDateTime,
  isValidIstDay,
  startOfIstDay,
} = require("./subscription-dates.util");

describe("IST day helpers", () => {
  it("starts an IST day at 18:30 UTC of the day before", () => {
    expect(startOfIstDay("2026-11-20").toISOString()).toBe("2026-11-19T18:30:00.000Z");
  });

  it("shows IST wall-clock time", () => {
    expect(formatIstDateTime(new Date("2026-11-20T10:00:00.000Z"))).toBe("2026-11-20 15:30");
    expect(formatIstDateTime(new Date("2026-11-20T20:00:00.000Z"))).toBe("2026-11-21 01:30");
  });

  it.each([
    ["2026-11-20", true],
    ["2028-02-29", true],
    ["2026-02-31", false],
    ["2026-13-01", false],
    ["20-11-2026", false],
    ["2026-11-20T10:00", false],
    ["", false],
  ])("checks %s as a calendar day: %s", (value, expected) => {
    expect(isValidIstDay(value)).toBe(expected);
  });
});

describe("subscription dates", () => {
  it("adds calendar months", () => {
    const start = new Date("2026-11-20T10:00:00.000Z");
    expect(addMonths(start, 1).toISOString()).toBe("2026-12-20T10:00:00.000Z");
    expect(addMonths(start, 3).toISOString()).toBe("2027-02-20T10:00:00.000Z");
    expect(addMonths(start, 12).toISOString()).toBe("2027-11-20T10:00:00.000Z");
  });

  it("clamps the day to the end of a shorter month", () => {
    expect(addMonths(new Date("2026-01-31T10:00:00.000Z"), 1).toISOString()).toBe("2026-02-28T10:00:00.000Z");
    expect(addMonths(new Date("2028-01-31T10:00:00.000Z"), 1).toISOString()).toBe("2028-02-29T10:00:00.000Z");
  });

  it("works on the IST calendar, not the UTC one", () => {
    // 31 Jan 2026 23:00 IST is still 31 Jan UTC 17:30, but 1 Feb 00:30 IST is 31 Jan UTC 19:00
    const start = new Date("2026-01-31T19:00:00.000Z");
    expect(formatIstDate(start)).toBe("2026-02-01");
    expect(formatIstDate(addMonths(start, 1))).toBe("2026-03-01");
  });

  it("returns the same instant for zero months and rejects bad input", () => {
    const start = new Date("2026-11-20T10:00:00.000Z");
    expect(addMonths(start, 0).toISOString()).toBe(start.toISOString());
    expect(() => addMonths(start, -1)).toThrow(RangeError);
    expect(() => addMonths(start, 1.5)).toThrow(RangeError);
  });

  it("adds days", () => {
    expect(addDays(new Date("2026-11-20T10:00:00.000Z"), 30).toISOString()).toBe("2026-12-20T10:00:00.000Z");
  });

  it("counts whole days remaining, rounded up and never negative", () => {
    const now = new Date("2026-11-20T10:00:00.000Z");
    expect(daysRemaining(new Date("2026-11-27T10:00:00.000Z"), now)).toBe(7);
    expect(daysRemaining(new Date("2026-11-20T12:00:00.000Z"), now)).toBe(1);
    expect(daysRemaining(new Date("2026-11-19T10:00:00.000Z"), now)).toBe(0);
  });

  it("detects expiry at the exact end instant", () => {
    const end = new Date("2026-11-20T10:00:00.000Z");
    expect(isExpired(end, new Date("2026-11-20T09:59:59.999Z"))).toBe(false);
    expect(isExpired(end, new Date("2026-11-20T10:00:00.000Z"))).toBe(true);
  });
});
