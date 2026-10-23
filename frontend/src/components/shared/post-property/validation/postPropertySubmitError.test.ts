import { describe, expect, it } from "vitest";
import { ApiError } from "@/services/apiClient";
import {
  GENERIC_SUBMIT_ERROR,
  getSubmitErrorMessage,
  isUnauthorizedError,
} from "./postPropertySubmitError";

describe("getSubmitErrorMessage", () => {
  it("prefers the first validation error from the API", () => {
    const error = new ApiError("Validation failed", 400, ["Pincode must be 6 digits", "Other"]);

    expect(getSubmitErrorMessage(error)).toBe("Pincode must be 6 digits");
  });

  it("falls back to the API message", () => {
    expect(getSubmitErrorMessage(new ApiError("Property not found.", 404))).toBe(
      "Property not found.",
    );
  });

  it("uses a generic message for unknown errors", () => {
    expect(getSubmitErrorMessage(new Error("boom"))).toBe(GENERIC_SUBMIT_ERROR);
  });
});

describe("isUnauthorizedError", () => {
  it("is true only for a 401 API error", () => {
    expect(isUnauthorizedError(new ApiError("Unauthorized", 401))).toBe(true);
    expect(isUnauthorizedError(new ApiError("Forbidden", 403))).toBe(false);
    expect(isUnauthorizedError(new Error("401"))).toBe(false);
  });
});
