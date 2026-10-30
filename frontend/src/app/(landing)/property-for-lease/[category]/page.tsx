import {
  PropertySearchResultsPage,
  generateSearchMetadata,
  type SearchRouteProps,
} from "@/components/landing/property-search/PropertySearchResultsPage";

const ROUTE = { transaction: "property-for-lease" } as const;

export const generateMetadata = (props: SearchRouteProps) =>
  generateSearchMetadata(ROUTE, props);

export default function PropertyForLeasePage(props: SearchRouteProps) {
  return <PropertySearchResultsPage route={ROUTE} {...props} />;
}
