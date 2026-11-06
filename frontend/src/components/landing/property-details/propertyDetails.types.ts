import type { PublicAmenityItem } from "@/services/propertySearch.service";
import type {
  PublicSearchListing,
  PublicSearchPostedBy,
} from "@/components/landing/property-search/property-list/publicSearchListing.types";

export type PropertyDetailsBreadcrumb = {
  label: string;
  href?: string;
};

export type PropertyDetailsSpecRow = {
  label: string;
  value: string;
};

export type FloorPlanViewType = "2d" | "3d";

export type PropertyDetailsFloorPlan = {
  id: string;
  label: string;
  planType: FloorPlanViewType;
  areaLabel: string;
  areaType: string;
  priceLabel: string;
  imageUrl: string | null;
};

export type PropertyDetailsDeveloper = {
  name: string;
  totalProjects: number;
  ongoingProjects: number;
  completedProjects: number;
  description: string;
};

export type PropertyDetailsPoster = {
  name: string;
  postedBy: PublicSearchPostedBy;
};

export type PropertyDetailsNearbyPlace = {
  place: string;
  distance: string | null;
};

export type PropertyDetailsFaq = {
  question: string;
  answer: string;
};

export type PropertyDetailsImageCategory = {
  id: string;
  label: string;
  images: string[];
};

export type PropertyDetailsBase = {
  id: string;
  displayPropertyId: string;
  listing: PublicSearchListing;
  images: string[];
  imageCategories: PropertyDetailsImageCategory[];
  breadcrumbs: PropertyDetailsBreadcrumb[];
  pageTitle: string;
  headlineTitle: string;
  headlineSubtitle: string;
  aboutSectionTitle: string;
  address: string;
  description: string;
  amenities: PublicAmenityItem[];
  nearbyPlaces: PropertyDetailsNearbyPlace[];
  faqs: PropertyDetailsFaq[];
  similarListings: PublicSearchListing[];
  similarScope: "locality" | "city";
  poster: PropertyDetailsPoster;
};

export type PropertyDetailsProjectView = PropertyDetailsBase & {
  kind: "project";
  launchDate: string;
  possessionLabel: string;
  reraNumber: string | null;
  overviewRows: PropertyDetailsSpecRow[];
  pricingRows: PropertyDetailsSpecRow[];
  floorPlans: PropertyDetailsFloorPlan[];
  bhkConfigurations: string[];
  projectUsps: string[];
  developer: PropertyDetailsDeveloper;
};

export type PropertyDetailsUnitView = PropertyDetailsBase & {
  kind: "unit";
  furnishingItems: PublicAmenityItem[];
  propertyDetailRows: PropertyDetailsSpecRow[];
  pricingRows: PropertyDetailsSpecRow[];
};

export type PropertyDetailsView = PropertyDetailsProjectView | PropertyDetailsUnitView;
