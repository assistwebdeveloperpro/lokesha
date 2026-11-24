import type { Metadata } from "next";
import { SITE_NAME, buildSiteUrl } from "@/lib/siteUrl";

export const DEFAULT_OG_IMAGE_PATH = "/assets/images/homepage/hero-banner.png";
export const PROPERTY_FALLBACK_IMAGE_PATH = "/no-photo-available.png";

export const SITE_DESCRIPTION =
  "Lokesha is a trusted real estate platform to buy, sell, rent, and discover residential and commercial properties across India. Connect with property owners, builders, and agents effortlessly.";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  ogTitle?: string;
  image?: string | null;
  fallbackImagePath?: string;
};

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

const toAbsoluteUrl = (value: string) =>
  isAbsoluteUrl(value) ? value : buildSiteUrl(value);

// Previews read best as plain text of a sensible length
export function truncateText(text: string, limit: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > limit
    ? `${clean.slice(0, limit - 1).trimEnd()}…`
    : clean;
}

// Next replaces a parent's openGraph wholesale, so every page sets the full set
export function buildPageMetadata({
  title,
  description,
  path,
  ogTitle = title,
  image,
  fallbackImagePath = DEFAULT_OG_IMAGE_PATH,
}: PageMetadataInput): Metadata {
  const url = buildSiteUrl(path);
  const imageUrl = toAbsoluteUrl(image || fallbackImagePath);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: ogTitle,
      description,
      url,
      images: [{ url: imageUrl, alt: ogTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [imageUrl],
    },
  };
}
