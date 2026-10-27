import { describe, expect, it } from "vitest";
import { formatTimeAgo } from "./formatTimeAgo";

const now = new Date("2026-10-27T12:00:00.000Z");
const ago = (seconds: number) => new Date(now.getTime() - seconds * 1000).toISOString();

describe("formatTimeAgo", () => {
  it.each([
    [10, "Just now"],
    [59, "Just now"],
    [60, "1 minute ago"],
    [5 * 60, "5 minutes ago"],
    [60 * 60, "1 hour ago"],
    [2 * 60 * 60, "2 hours ago"],
    [6 * 24 * 60 * 60, "6 days ago"],
    [7 * 24 * 60 * 60, "1 week ago"],
    [21 * 24 * 60 * 60, "3 weeks ago"],
    [60 * 24 * 60 * 60, "2 months ago"],
    [400 * 24 * 60 * 60, "1 year ago"],
  ])("%i seconds -> %s", (seconds, label) => {
    expect(formatTimeAgo(ago(seconds), now)).toBe(label);
  });

  it("treats a time in the future as just now", () => {
    expect(formatTimeAgo(ago(-120), now)).toBe("Just now");
  });

  it("returns nothing for an invalid date", () => {
    expect(formatTimeAgo("nope", now)).toBe("");
  });
});
