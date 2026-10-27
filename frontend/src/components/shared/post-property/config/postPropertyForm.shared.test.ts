import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getPossessionDateInputMax,
  getPossessionDateInputMin,
} from "./postPropertyForm.shared";

describe("possession date input bounds", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 27, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getPossessionDateInputMin", () => {
    it("has no minimum for ready to move", () => {
      expect(
        getPossessionDateInputMin("2026-01-01", "ready-to-move"),
      ).toBeUndefined();
    });

    it("uses today for under construction", () => {
      expect(getPossessionDateInputMin("", "under-construction")).toBe(
        "2026-10-27",
      );
    });

    it("keeps an existing past date selectable when editing", () => {
      expect(getPossessionDateInputMin("2026-01-01", "under-construction")).toBe(
        "2026-01-01",
      );
    });

    it("uses today when no status is given", () => {
      expect(getPossessionDateInputMin("")).toBe("2026-10-27");
    });
  });

  describe("getPossessionDateInputMax", () => {
    it("caps ready to move at today", () => {
      expect(getPossessionDateInputMax("ready-to-move")).toBe("2026-10-27");
    });

    it("has no maximum for other statuses", () => {
      expect(getPossessionDateInputMax("under-construction")).toBeUndefined();
      expect(getPossessionDateInputMax("pre-launch")).toBeUndefined();
      expect(getPossessionDateInputMax()).toBeUndefined();
    });
  });
});
