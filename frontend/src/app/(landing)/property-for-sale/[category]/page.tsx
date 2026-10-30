import {
  PropertySearchResultsPage,
  generateSearchMetadata,
  type SearchRouteProps,
} from "@/components/landing/property-search/PropertySearchResultsPage";

const ROUTE = { transaction: "property-for-sale" } as const;

export const generateMetadata = (props: SearchRouteProps) =>
  generateSearchMetadata(ROUTE, props);

export default function PropertyForSalePage(props: SearchRouteProps) {
  return <PropertySearchResultsPage route={ROUTE} {...props} />;
}
