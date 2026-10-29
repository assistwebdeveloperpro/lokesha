import {
  PropertySearchResultsPage,
  generateSearchMetadata,
  type SearchRouteProps,
} from "@/components/landing/property-search/PropertySearchResultsPage";

export const generateMetadata = (props: SearchRouteProps) =>
  generateSearchMetadata("property-for-rent", props);

export default function PropertyForRentPage(props: SearchRouteProps) {
  return <PropertySearchResultsPage transaction="property-for-rent" {...props} />;
}
