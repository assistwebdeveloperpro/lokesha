import type { Metadata } from "next";
import { FeaturedProjectsContent } from "@/components/landing/featured-projects/FeaturedProjectsContent";
import Header from "@/components/shared/layout/Header";
import {
  LANDING_CATEGORY_SLUGS,
  type LandingCategory,
} from "@/lib/property-search-url/landingUrl.config";
import type { LimelightProjectsFilters } from "@/services/limelightProjects.service";
import { buildPageMetadata } from "@/lib/seo/pageMetadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Featured Projects | Lokesha",
  ogTitle: "Featured Projects",
  description:
    "Explore the featured builder projects handpicked on Lokesha and find your place with us.",
  path: "/property/featured-projects",
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const LISTING_TYPES = ["sale", "rent-lease"] as const;
const CATEGORIES = Object.keys(LANDING_CATEGORY_SLUGS) as LandingCategory[];

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

function pickOption<T extends string>(options: readonly T[], value: string | undefined) {
  return options.find((option) => option === value);
}

export default async function FeaturedProjectsPage({
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
        <FeaturedProjectsContent filters={filters} />
      </main>
    </div>
  );
}
