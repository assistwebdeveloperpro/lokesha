import {
  PropertySearchResultsPage,
  generateSearchMetadata,
  type SearchRouteProps,
} from "@/components/landing/property-search/PropertySearchResultsPage";

export const generateMetadata = (props: SearchRouteProps) =>
  generateSearchMetadata("property-for-sale", props);

export default function PropertyForSalePage(props: SearchRouteProps) {
  return <PropertySearchResultsPage transaction="property-for-sale" {...props} />;
}
