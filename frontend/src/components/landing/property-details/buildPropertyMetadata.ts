import type { Metadata } from "next";
import { buildShortPath } from "@/lib/property-share/propertyShare";
import {
  PROPERTY_FALLBACK_IMAGE_PATH,
  buildPageMetadata,
  truncateText,
} from "@/lib/seo/pageMetadata";
import { SITE_NAME } from "@/lib/siteUrl";
import type { PropertyDetailsView } from "./propertyDetails.types";

const DESCRIPTION_LIMIT = 200;

export function buildPropertyMetadata(details: PropertyDetailsView): Metadata {
  const { listing } = details;
  const location = [listing.locality, listing.city].filter(Boolean).join(", ");

  return buildPageMetadata({
    title: `${details.pageTitle} | ${SITE_NAME}`,
    ogTitle: listing.title,
    description: truncateText(
      [location, details.description].filter(Boolean).join(" - "),
      DESCRIPTION_LIMIT,
    ),
    path: buildShortPath(listing.shortCode),
    image: details.images[0] ?? listing.imageUrl,
    fallbackImagePath: PROPERTY_FALLBACK_IMAGE_PATH,
  });
}
