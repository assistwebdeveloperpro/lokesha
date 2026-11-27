import type { Metadata } from "next";
import { PopularProjectsContent } from "@/components/landing/popular-projects/PopularProjectsContent";
import Header from "@/components/shared/layout/Header";
import {
  LANDING_CATEGORY_SLUGS,
  type LandingCategory,
} from "@/lib/property-search-url/landingUrl.config";
import type { LimelightProjectsFilters } from "@/services/limelightProjects.service";
import { buildPageMetadata } from "@/lib/seo/pageMetadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Popular Projects | Lokesha",
  ogTitle: "Popular Projects",
  description:
    "Explore the most popular builder projects on Lokesha and find your place with us.",
  path: "/property/popular-projects",
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const LISTING_TYPES = ["sale", "rent-lease"] as const;
const CATEGORIES = Object.keys(LANDING_CATEGORY_SLUGS) as LandingCategory[];

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

function pickOption<T extends string>(options: readonly T[], value: string | undefined) {
  return options.find((option) => option === value);
}

export default async function PopularProjectsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const filters: LimelightProjectsFilters = {
    listingType: pickOption(LISTING_TYPES, firstValue(params.listingType)),
    category: pickOption(CATEGORIES, firstValue(params.category)),
    city: firstValue(params.city) || undefined,
  };

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 font-sans">
      <Header showCitySelector />
      <main className="flex flex-1 flex-col">
        <PopularProjectsContent filters={filters} />
      </main>
    </div>
  );
}
