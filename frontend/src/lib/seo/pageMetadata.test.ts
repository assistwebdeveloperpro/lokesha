import { describe, expect, it } from "vitest";
import {
  DEFAULT_OG_IMAGE_PATH,
  PROPERTY_FALLBACK_IMAGE_PATH,
  buildPageMetadata,
  truncateText,
} from "./pageMetadata";

describe("buildPageMetadata", () => {
  const base = { title: "3 BHK | Lokesha", description: "Bopal", path: "/p_detail/Al65" };

  it("sets the required open graph and twitter fields", () => {
    const metadata = buildPageMetadata({ ...base, ogTitle: "3 BHK", image: "https://cdn.test/a.jpg" });

    expect(metadata.openGraph).toMatchObject({
      type: "website",
      siteName: "Lokesha",
      title: "3 BHK",
      description: "Bopal",
      url: expect.stringMatching(/\/p_detail\/Al65$/),
      images: [{ url: "https://cdn.test/a.jpg" }],
    });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image", images: ["https://cdn.test/a.jpg"] });
    expect(metadata.alternates?.canonical).toMatch(/\/p_detail\/Al65$/);
  });

  it("falls back to an absolute site image when there is none", () => {
    const [image] = buildPageMetadata({ ...base, fallbackImagePath: PROPERTY_FALLBACK_IMAGE_PATH }).openGraph!
      .images as { url: string }[];

    expect(image.url).toMatch(/^https?:\/\/.+\/no-photo-available\.png$/);
  });

  it("uses the site banner by default", () => {
    const [image] = buildPageMetadata(base).openGraph!.images as { url: string }[];

    expect(image.url.endsWith(DEFAULT_OG_IMAGE_PATH)).toBe(true);
  });
});

describe("truncateText", () => {
  it("collapses whitespace and cuts long text with an ellipsis", () => {
    expect(truncateText("a  b\n c", 50)).toBe("a b c");
    expect(truncateText("abcdefghij", 5)).toBe("abcd…");
  });
});
