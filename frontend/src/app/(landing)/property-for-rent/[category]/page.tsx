import {
  PropertySearchResultsPage,
  generateSearchMetadata,
  type SearchRouteProps,
} from "@/components/landing/property-search/PropertySearchResultsPage";

const ROUTE = { transaction: "property-for-rent" } as const;

export const generateMetadata = (props: SearchRouteProps) =>
  generateSearchMetadata(ROUTE, props);

export default function PropertyForRentPage(props: SearchRouteProps) {
  return <PropertySearchResultsPage route={ROUTE} {...props} />;
}
