import { buildSiteUrl } from "@/lib/siteUrl";

export const SHORT_URL_BASE = "/p_detail";

export type ShareProperty = {
  shortCode: string;
  title: string;
  location: string;
  description?: string;
};

export type ShareChannel = "whatsapp" | "facebook" | "instagram" | "gmail";

export const buildShortPath = (shortCode: string) =>
  `${SHORT_URL_BASE}/${shortCode}`;

export const buildShortUrl = (shortCode: string) =>
  buildSiteUrl(buildShortPath(shortCode));

const propertyLines = ({ title, location, shortCode }: ShareProperty) => [
  title,
  location,
  buildShortUrl(shortCode),
];

export function buildWhatsAppMessage(properties: ShareProperty[]): string {
  if (properties.length === 1) {
    return ["Check out this property on Lokesha:", ...propertyLines(properties[0])].join("\n");
  }

  const items = properties.map(
    (property, index) => `${index + 1}. ${propertyLines(property).join("\n")}`,
  );
  return [`Check out these ${properties.length} properties on Lokesha:`, ...items].join("\n\n");
}

export function buildEmailSubject(properties: ShareProperty[]): string {
  return properties.length === 1
    ? properties[0].title
    : `${properties.length} properties shared from Lokesha`;
}

export function buildEmailBody(properties: ShareProperty[]): string {
  if (properties.length === 1) {
    const [property] = properties;
    return [
      "Hi,",
      "I found this property on Lokesha and thought you might like it.",
      [property.title, property.location, property.description]
        .filter(Boolean)
        .join("\n"),
      `View property: ${buildShortUrl(property.shortCode)}`,
    ].join("\n\n");
  }

  const items = properties.map(
    (property, index) => `${index + 1}. ${propertyLines(property).join("\n")}`,
  );
  return [
    "Hi,",
    "I shortlisted these properties on Lokesha and thought you might like them.",
    ...items,
  ].join("\n\n");
}

export const buildAllLinksText = (properties: ShareProperty[]) =>
  properties.map(({ shortCode }) => buildShortUrl(shortCode)).join("\n");

export const buildWhatsAppShareUrl = (properties: ShareProperty[]) =>
  `https://wa.me/?text=${encodeURIComponent(buildWhatsAppMessage(properties))}`;

export const buildFacebookShareUrl = (shortCode: string) =>
  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(buildShortUrl(shortCode))}`;

export const buildGmailShareUrl = (properties: ShareProperty[]) =>
  `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(buildEmailSubject(properties))}&body=${encodeURIComponent(buildEmailBody(properties))}`;

export const FACEBOOK_HOME_URL = "https://www.facebook.com/";
export const INSTAGRAM_HOME_URL = "https://www.instagram.com/";
