import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Header from "@/components/shared/layout/Header";
import { buildSearchUrl } from "@/lib/property-search-url/buildSearchUrl";
import { getCanonicalSearchRedirect } from "@/lib/property-search-url/canonicalSearchUrl";
import { parseSearchUrl } from "@/lib/property-search-url/parseSearchUrl";
import {
  KEYWORD_SEARCH_PATHS,
  type KeywordSearchSlug,
} from "@/lib/property-search-url/searchUrl.config";
import type {
  SearchParamRecord,
  TransactionSlug,
} from "@/lib/property-search-url/searchUrl.types";
import { buildPageMetadata } from "@/lib/seo/pageMetadata";
import { PropertySearchHeaderSearch } from "./header-search/PropertySearchHeaderSearch";
import { PropertySearchResultsContent } from "./PropertySearchResultsContent";
import { buildSearchHeading } from "./searchPageText";

export type SearchRouteProps = {
  params: Promise<{ category?: string }>;
  searchParams: Promise<SearchParamRecord>;
};

export type SearchRoute =
  | { transaction: TransactionSlug }
  | { keywordSlug: KeywordSearchSlug };

async function readSearchInput(
  route: SearchRoute,
  { params, searchParams }: SearchRouteProps,
) {
  if ("keywordSlug" in route) {
    return {
      ...KEYWORD_SEARCH_PATHS[route.keywordSlug],
      pathname: `/${route.keywordSlug}`,
      searchParams: await searchParams,
    };
  }

  const { category = "" } = await params;
  return {
    transaction: route.transaction,
    category,
    searchParams: await searchParams,
  };
}

export async function generateSearchMetadata(
  route: SearchRoute,
  props: SearchRouteProps,
): Promise<Metadata> {
  const criteria = parseSearchUrl(await readSearchInput(route, props));
  if (!criteria) return {};

  const heading = buildSearchHeading(criteria);
  return buildPageMetadata({
    title: `${heading} | Lokesha`,
    ogTitle: heading,
    description: `${heading}. Filter by BHK, budget, property type and construction status.`,
    path: buildSearchUrl(criteria),
  });
}

export async function PropertySearchResultsPage({
  route,
  ...props
}: SearchRouteProps & { route: SearchRoute }) {
  const input = await readSearchInput(route, props);
  const criteria = parseSearchUrl(input);
  if (!criteria) notFound();

  const canonicalUrl = getCanonicalSearchRedirect(input);
  if (canonicalUrl) redirect(canonicalUrl);

  return (
    <div className="flex min-h-screen w-full shrink-0 flex-col bg-white font-sans">
      <Header
        compact
        searchSlot={<PropertySearchHeaderSearch criteria={criteria} />}
      />
      <PropertySearchResultsContent criteria={criteria} />
    </div>
  );
}
