import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { HomePageContent } from "@/components/landing/home/HomePageContent";
import {
  ALL_INDIA_LABEL,
  POPULAR_CITIES,
} from "@/components/shared/layout/city-selector/citySelector.shared";
import { INDIAN_CITIES } from "@/data/indianCities";
import { buildLandingUrl } from "@/lib/property-search-url/buildLandingUrl";
import { LANDING_TRANSACTION_PARAM } from "@/lib/property-search-url/landingUrl.config";
import { parseLandingUrl } from "@/lib/property-search-url/parseLandingUrl";
import { buildPageMetadata } from "@/lib/seo/pageMetadata";

type CityLandingPageProps = {
  params: Promise<{ locationSlug: string; categorySlug: string }>;
  searchParams: Promise<{ category?: string | string[] }>;
};

const KNOWN_CITIES = [
  ...new Set([...INDIAN_CITIES, ...POPULAR_CITIES.map((city) => city.name)]),
];

async function readSelection({ params, searchParams }: CityLandingPageProps) {
  const { locationSlug, categorySlug } = await params;
  const { category: transactionCode } = await searchParams;

  return {
    locationSlug,
    categorySlug,
    selection: parseLandingUrl({
      locationSlug,
      categorySlug,
      transactionCode: Array.isArray(transactionCode)
        ? transactionCode[0]
        : transactionCode,
      knownCities: KNOWN_CITIES,
    }),
  };
}

export async function generateMetadata(
  props: CityLandingPageProps,
): Promise<Metadata> {
  const { locationSlug, categorySlug, selection } = await readSelection(props);
  if (!selection) return {};

  const place = selection.cityName ?? ALL_INDIA_LABEL;
  return buildPageMetadata({
    title: `Properties in ${place} | Lokesha`,
    ogTitle: `Properties in ${place}`,
    description: `Buy, sell and rent residential and commercial properties in ${place} on Lokesha.`,
    path: `/${locationSlug}/${categorySlug}`.toLowerCase(),
  });
}

export default async function CityLandingPage(props: CityLandingPageProps) {
  const { locationSlug, categorySlug, selection } = await readSelection(props);
  if (!selection) notFound();

  const requestedPath = `/${locationSlug}/${categorySlug}`;
  const { category: transactionCode } = await props.searchParams;
  const code = Array.isArray(transactionCode)
    ? transactionCode[0]
    : transactionCode;
  const isLowercase = (value: string) => value === value.toLowerCase();

  if (!isLowercase(requestedPath) || (code && !isLowercase(code))) {
    const canonicalPath = buildLandingUrl({
      category: selection.category,
      cityName: selection.cityName,
      transaction: null,
    });
    redirect(
      code
        ? `${canonicalPath}?${LANDING_TRANSACTION_PARAM}=${encodeURIComponent(code.toLowerCase())}`
        : canonicalPath,
    );
  }

  return (
    <HomePageContent
      initialCategory={selection.category}
      initialCity={selection.cityName ?? ALL_INDIA_LABEL}
      initialTransaction={selection.transaction}
    />
  );
}
