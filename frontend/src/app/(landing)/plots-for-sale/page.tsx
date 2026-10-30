import {
  PropertySearchResultsPage,
  generateSearchMetadata,
  type SearchRouteProps,
} from "@/components/landing/property-search/PropertySearchResultsPage";

const ROUTE = { keywordSlug: "plots-for-sale" } as const;

export const generateMetadata = (props: SearchRouteProps) =>
  generateSearchMetadata(ROUTE, props);

export default function PlotsForSalePage(props: SearchRouteProps) {
  return <PropertySearchResultsPage route={ROUTE} {...props} />;
}
