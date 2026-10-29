import { notFound } from "next/navigation";
import { HomePageContent } from "@/components/landing/home/HomePageContent";
import {
  ALL_INDIA_LABEL,
  POPULAR_CITIES,
} from "@/components/shared/layout/city-selector/citySelector.shared";
import { INDIAN_CITIES } from "@/data/indianCities";
import { parseLandingUrl } from "@/lib/property-search-url/parseLandingUrl";

type CityLandingPageProps = {
  params: Promise<{ locationSlug: string; categorySlug: string }>;
  searchParams: Promise<{ category?: string | string[] }>;
};

const KNOWN_CITIES = [
  ...new Set([...INDIAN_CITIES, ...POPULAR_CITIES.map((city) => city.name)]),
];

export default async function CityLandingPage({
  params,
  searchParams,
}: CityLandingPageProps) {
  const { locationSlug, categorySlug } = await params;
  const { category: transactionCode } = await searchParams;
  const selection = parseLandingUrl({
    locationSlug,
    categorySlug,
    transactionCode: Array.isArray(transactionCode)
      ? transactionCode[0]
      : transactionCode,
    knownCities: KNOWN_CITIES,
  });
  if (!selection) notFound();

  return (
    <HomePageContent
      initialCategory={selection.category}
      initialCity={selection.cityName ?? ALL_INDIA_LABEL}
      initialTransaction={selection.transaction}
    />
  );
}
