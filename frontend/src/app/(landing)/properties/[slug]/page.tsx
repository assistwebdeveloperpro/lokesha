import {
  PropertySearchResultsPage,
  generateSearchMetadata,
  type SearchRouteProps,
} from "@/components/landing/property-search/PropertySearchResultsPage";

export const generateMetadata = generateSearchMetadata;

export default function PropertiesPage(props: SearchRouteProps) {
  return <PropertySearchResultsPage {...props} />;
}
