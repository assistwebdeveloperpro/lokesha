import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ALL_INDIA_LABEL } from "@/components/shared/layout/city-selector/citySelector.shared";
import { buildLandingUrl } from "@/lib/property-search-url/buildLandingUrl";
import { LANDING_KNOWN_CITIES } from "@/lib/property-search-url/landingKnownCities";
import type { LandingGroup } from "@/lib/property-search-url/landingUrl.config";
import { parseLandingUrl } from "@/lib/property-search-url/parseLandingUrl";
import { buildPageMetadata } from "@/lib/seo/pageMetadata";
import { HomePageContent } from "./HomePageContent";

export type LandingRouteProps = {
  params: Promise<{ slug: string }>;
};

async function readSelection(group: LandingGroup, { params }: LandingRouteProps) {
  const { slug } = await params;
  return {
    slug,
    selection: parseLandingUrl({ group, slug, knownCities: LANDING_KNOWN_CITIES }),
  };
}

export async function generateLandingMetadata(
  group: LandingGroup,
  props: LandingRouteProps,
): Promise<Metadata> {
  const { selection } = await readSelection(group, props);
  if (!selection) return {};

  const place = selection.cityName ?? ALL_INDIA_LABEL;
  return buildPageMetadata({
    title: `Properties in ${place} | Lokesha`,
    ogTitle: `Properties in ${place}`,
    description: `Buy, sell and rent residential and commercial properties in ${place} on Lokesha.`,
    path: buildLandingUrl(selection),
  });
}

export async function LandingRoutePage({
  group,
  ...props
}: LandingRouteProps & { group: LandingGroup }) {
  const { slug, selection } = await readSelection(group, props);
  if (!selection) notFound();

  const canonicalPath = buildLandingUrl(selection);
  if (canonicalPath !== `/${group}/${slug}`) redirect(canonicalPath);

  return (
    <HomePageContent
      initialCategory={selection.category}
      initialCity={selection.cityName ?? ALL_INDIA_LABEL}
      initialTransaction={selection.transaction}
    />
  );
}
