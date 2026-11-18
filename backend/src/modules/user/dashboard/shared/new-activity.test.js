const { NEW_ACTIVITY_WINDOW_MS, isNewActivity } = require("./new-activity");

const NOW = new Date("2026-11-18T12:00:00.000Z").getTime();

describe("isNewActivity", () => {
  it("is new inside the 48 hour window", () => {
    expect(isNewActivity(new Date(NOW - NEW_ACTIVITY_WINDOW_MS + 1000), NOW)).toBe(true);
  });

  it("is not new once the window has passed", () => {
    expect(isNewActivity(new Date(NOW - NEW_ACTIVITY_WINDOW_MS), NOW)).toBe(false);
  });

  it("accepts an ISO string", () => {
    expect(isNewActivity("2026-11-18T10:00:00.000Z", NOW)).toBe(true);
  });
});
