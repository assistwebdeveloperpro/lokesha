import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import {
  createDebouncedRecentSearchRecorder,
  isRecordableCriteriaPatch,
  RECENT_SEARCH_DEBOUNCE_MS,
} from "./debouncedRecentSearchRecorder";

const criteria = (cityName: string) => ({ cityName }) as PropertySearchCriteria;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("createDebouncedRecentSearchRecorder", () => {
  it("records only the final criteria of a burst", () => {
    const record = vi.fn();
    const recorder = createDebouncedRecentSearchRecorder(record);

    recorder.schedule(criteria("Surat"));
    vi.advanceTimersByTime(RECENT_SEARCH_DEBOUNCE_MS - 100);
    recorder.schedule(criteria("Pune"));
    vi.advanceTimersByTime(RECENT_SEARCH_DEBOUNCE_MS);

    expect(record).toHaveBeenCalledTimes(1);
    expect(record).toHaveBeenCalledWith(criteria("Pune"));
  });

  it("records nothing before the delay passes", () => {
    const record = vi.fn();

    createDebouncedRecentSearchRecorder(record).schedule(criteria("Surat"));
    vi.advanceTimersByTime(RECENT_SEARCH_DEBOUNCE_MS - 1);

    expect(record).not.toHaveBeenCalled();
  });

  it("flush records the pending criteria once and immediately", () => {
    const record = vi.fn();
    const recorder = createDebouncedRecentSearchRecorder(record);

    recorder.schedule(criteria("Surat"));
    recorder.flush();
    recorder.flush();
    vi.advanceTimersByTime(RECENT_SEARCH_DEBOUNCE_MS);

    expect(record).toHaveBeenCalledTimes(1);
  });

  it("flush without a pending search does nothing", () => {
    const record = vi.fn();

    createDebouncedRecentSearchRecorder(record).flush();

    expect(record).not.toHaveBeenCalled();
  });
});

describe("isRecordableCriteriaPatch", () => {
  it("skips page-only patches", () => {
    expect(isRecordableCriteriaPatch({ page: 2 })).toBe(false);
    expect(isRecordableCriteriaPatch({})).toBe(false);
  });

  it("records patches that change a filter", () => {
    expect(isRecordableCriteriaPatch({ localities: ["Bopal"] })).toBe(true);
    expect(isRecordableCriteriaPatch({ page: 1, bedrooms: [2] })).toBe(true);
  });
});
