import {
  PropertySearchResultsPage,
  generateSearchMetadata,
  type SearchRouteProps,
} from "@/components/landing/property-search/PropertySearchResultsPage";

export const generateMetadata = (props: SearchRouteProps) =>
  generateSearchMetadata("property-for-lease", props);

export default function PropertyForLeasePage(props: SearchRouteProps) {
  return <PropertySearchResultsPage transaction="property-for-lease" {...props} />;
}
