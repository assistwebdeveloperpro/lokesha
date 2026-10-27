import { describe, expect, it } from "vitest";
import { resolveOptionalAmenities } from "./postingAs";

describe("resolveOptionalAmenities", () => {
  it("keeps amenities optional for owner and agent posters", () => {
    expect(
      resolveOptionalAmenities({
        role: "buyer_owner_tenant",
        isStaff: false,
        postingAs: "",
        isBuilderPost: false,
      }),
    ).toBe(true);

    expect(
      resolveOptionalAmenities({
        role: "agent",
        isStaff: false,
        postingAs: "",
        isBuilderPost: false,
      }),
    ).toBe(true);
  });

  it("requires amenities for builder posts", () => {
    expect(
      resolveOptionalAmenities({
        role: "builder",
        isStaff: false,
        postingAs: "",
        isBuilderPost: true,
      }),
    ).toBe(false);
  });

  it("matches staff add flow when posting as owner or agent", () => {
    expect(
      resolveOptionalAmenities({
        role: "lokesha_staff",
        isStaff: true,
        postingAs: "buyer_owner_tenant",
        isBuilderPost: false,
      }),
    ).toBe(true);
  });

  it("treats edited non-builder listings like owner posts", () => {
    expect(
      resolveOptionalAmenities({
        role: "lokesha_staff",
        isStaff: true,
        postingAs: "",
        isBuilderPost: false,
        isOwnerAgentListing: true,
      }),
    ).toBe(true);
  });
});
