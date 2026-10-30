import {
  PropertySearchResultsPage,
  generateSearchMetadata,
  type SearchRouteProps,
} from "@/components/landing/property-search/PropertySearchResultsPage";

const ROUTE = { keywordSlug: "pg-for-rent" } as const;

export const generateMetadata = (props: SearchRouteProps) =>
  generateSearchMetadata(ROUTE, props);

export default function PgForRentPage(props: SearchRouteProps) {
  return <PropertySearchResultsPage route={ROUTE} {...props} />;
}
