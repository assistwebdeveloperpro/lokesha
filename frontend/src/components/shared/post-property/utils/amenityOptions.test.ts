import { describe, expect, it, vi } from "vitest";
import type { AmenityOptionsResponse } from "@/services/property.service";
import {
  createAmenityOptionsLoader,
  getAmenityOptionsKey,
  toTileOptions,
} from "./amenityOptions";

const response: AmenityOptionsResponse = {
  amenities: [{ key: "lift", name: "Lift", imagePath: "/assets/images/amenities/lift.svg" }],
  furnishing: [{ key: "tv", name: "TV", imagePath: "/assets/images/furnishing/tv.svg" }],
};

const query = { listingType: "sale", propertyType: "residential", subType: "flat-apartment" };

describe("toTileOptions", () => {
  it("uses the stored key as the option id", () => {
    expect(toTileOptions(response)).toEqual({
      amenities: [{ id: "lift", label: "Lift", image: "/assets/images/amenities/lift.svg" }],
      furnishing: [{ id: "tv", label: "TV", image: "/assets/images/furnishing/tv.svg" }],
    });
  });
});

describe("getAmenityOptionsKey", () => {
  it("tells combinations apart and handles a missing sub type", () => {
    expect(getAmenityOptionsKey(query)).toBe("sale:residential:flat-apartment");
    expect(getAmenityOptionsKey({ listingType: "rent-lease", propertyType: "pg-co-living" })).toBe(
      "rent-lease:pg-co-living:",
    );
  });
});

describe("createAmenityOptionsLoader", () => {
  it("fetches each combination once", async () => {
    const fetcher = vi.fn().mockResolvedValue(response);
    const load = createAmenityOptionsLoader(fetcher);

    const [first, second] = await Promise.all([load(query, "t"), load(query, "t")]);
    await load(query, "t");

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith(query, "t");
    expect(first).toBe(second);
  });

  it("fetches again for another sub type", async () => {
    const fetcher = vi.fn().mockResolvedValue(response);
    const load = createAmenityOptionsLoader(fetcher);

    await load(query, "t");
    await load({ ...query, subType: "duplex" }, "t");

    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("does not keep a failed request", async () => {
    const fetcher = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(response);
    const load = createAmenityOptionsLoader(fetcher);

    await expect(load(query, "t")).rejects.toThrow("offline");
    await expect(load(query, "t")).resolves.toEqual(toTileOptions(response));
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
