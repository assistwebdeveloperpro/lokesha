import { describe, expect, it } from "vitest";
import {
  normalizePropertyGalleryCategories,
  orderGalleryImagesForCategory,
  resolveGalleryCategoryForImage,
} from "./propertyDetailsGallery.utils";

describe("propertyDetailsGallery.utils", () => {
  const categories = normalizePropertyGalleryCategories([
    { category: "kitchen", images: ["/kitchen.jpg"] },
    { category: "exterior", images: ["/ext-1.jpg", "/ext-2.jpg"] },
    { category: "living-room", images: ["/living.jpg"] },
  ]);

  it("sorts main photo first, then remaining step 4 categories", () => {
    const withMain = normalizePropertyGalleryCategories([
      { category: "kitchen", images: ["/kitchen.jpg"] },
      { category: "main-photo", images: ["/main.jpg"] },
      { category: "exterior", images: ["/ext.jpg"] },
    ]);
    expect(withMain.map((category) => category.id)).toEqual(["main-photo", "kitchen", "exterior"]);
  });

  it("sorts categories using step 4 photo menu order when main photo is absent", () => {
    expect(categories.map((category) => category.id)).toEqual(["kitchen", "exterior", "living-room"]);
  });

  it("shows the selected category first, then the remaining categories", () => {
    expect(orderGalleryImagesForCategory(categories, "living-room")).toEqual([
      "/living.jpg",
      "/kitchen.jpg",
      "/ext-1.jpg",
      "/ext-2.jpg",
    ]);
  });

  it("resolves the category for the active image", () => {
    expect(resolveGalleryCategoryForImage(categories, "/ext-2.jpg")).toBe("exterior");
  });
});
