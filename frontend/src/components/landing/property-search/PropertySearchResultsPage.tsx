import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Header from "@/components/shared/layout/Header";
import { getCanonicalSearchRedirect } from "@/lib/property-search-url/canonicalSearchUrl";
import { parseSearchUrl } from "@/lib/property-search-url/parseSearchUrl";
import type {
  SearchParamRecord,
  TransactionSlug,
} from "@/lib/property-search-url/searchUrl.types";
import { PropertySearchResultsContent } from "./PropertySearchResultsContent";
import { buildSearchHeading } from "./searchPageText";

export type SearchRouteProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<SearchParamRecord>;
};

async function readSearchInput(
  transaction: TransactionSlug,
  { params, searchParams }: SearchRouteProps,
) {
  const { category } = await params;
  return { transaction, category, searchParams: await searchParams };
}

export async function generateSearchMetadata(
  transaction: TransactionSlug,
  props: SearchRouteProps,
): Promise<Metadata> {
  const criteria = parseSearchUrl(await readSearchInput(transaction, props));
  if (!criteria) return {};

  const heading = buildSearchHeading(criteria);
  return {
    title: `${heading} | Lokesha`,
    description: `${heading}. Filter by BHK, budget, property type and construction status.`,
  };
}

export async function PropertySearchResultsPage({
  transaction,
  ...props
}: SearchRouteProps & { transaction: TransactionSlug }) {
  const input = await readSearchInput(transaction, props);
  const criteria = parseSearchUrl(input);
  if (!criteria) notFound();

  const canonicalUrl = getCanonicalSearchRedirect(input);
  if (canonicalUrl) redirect(canonicalUrl);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 font-sans">
      <Header />
      <PropertySearchResultsContent criteria={criteria} />
    </div>
  );
}
