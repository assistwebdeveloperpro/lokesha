import { describe, expect, it } from "vitest";
import { formatPostedByParam, parsePostedByParam } from "./postedByParam";

describe("parsePostedByParam", () => {
  it("accepts canonical roles and owner alias", () => {
    expect(parsePostedByParam("buyer_owner_tenant,agent,builder")).toEqual([
      "buyer_owner_tenant",
      "agent",
      "builder",
    ]);
    expect(parsePostedByParam("Owner,Agent")).toEqual([
      "buyer_owner_tenant",
      "agent",
    ]);
  });

  it("ignores unknown segments", () => {
    expect(parsePostedByParam("agent,admin")).toEqual(["agent"]);
  });
});

describe("formatPostedByParam", () => {
  it("writes the owner role as owner", () => {
    expect(formatPostedByParam("buyer_owner_tenant")).toBe("owner");
    expect(formatPostedByParam("agent")).toBe("agent");
  });
});
