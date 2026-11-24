import { describe, expect, it } from "vitest";
import {
  buildAllLinksText,
  buildFacebookShareUrl,
  buildGmailShareUrl,
  buildShortUrl,
  buildWhatsAppShareUrl,
  type ShareProperty,
} from "./propertyShare";

const first: ShareProperty = {
  shortCode: "Al65",
  title: "3 BHK Flat",
  location: "Bopal, Ahmedabad",
  description: "Spacious home",
};
const second: ShareProperty = {
  shortCode: "Bk72",
  title: "Plot",
  location: "Naroda, Ahmedabad",
};

describe("property share links", () => {
  it("builds the short url from the site origin", () => {
    expect(buildShortUrl("Al65")).toMatch(/\/p_detail\/Al65$/);
  });

  it("prefills a whatsapp message with title, location and url", () => {
    const text = decodeURIComponent(buildWhatsAppShareUrl([first]).split("text=")[1]);

    expect(text).toContain("3 BHK Flat");
    expect(text).toContain("Bopal, Ahmedabad");
    expect(text).toContain("/p_detail/Al65");
  });

  it("numbers every property in a multi share message", () => {
    const text = decodeURIComponent(buildWhatsAppShareUrl([first, second]).split("text=")[1]);

    expect(text).toContain("these 2 properties");
    expect(text).toContain("1. 3 BHK Flat");
    expect(text).toContain("2. Plot");
  });

  it("points the facebook dialog at the encoded short url", () => {
    const url = buildFacebookShareUrl("Al65");

    expect(url.startsWith("https://www.facebook.com/sharer/sharer.php?u=")).toBe(true);
    expect(decodeURIComponent(url.split("u=")[1])).toBe(buildShortUrl("Al65"));
  });

  it("includes the description in a single gmail draft", () => {
    const url = new URL(buildGmailShareUrl([first]));

    expect(url.searchParams.get("su")).toBe("3 BHK Flat");
    expect(url.searchParams.get("body")).toContain("Spacious home");
    expect(url.searchParams.get("body")).toContain("/p_detail/Al65");
  });

  it("lists one short url per line for copy all", () => {
    expect(buildAllLinksText([first, second]).split("\n")).toEqual([
      buildShortUrl("Al65"),
      buildShortUrl("Bk72"),
    ]);
  });
});
