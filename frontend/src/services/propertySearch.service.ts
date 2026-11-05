import type {
  PublicSearchListing,
  PublicSearchListResponse,
} from "@/components/landing/property-search/property-list/publicSearchListing.types";
import { apiFetch, getAssetUrl } from "./apiClient";

export type PublicPropertyAttributes = Record<string, string | number | boolean | null>;

export type PublicPropertyVariantCharges = {
  carParkingAvailable?: boolean | null;
  carParkingCount?: number | null;
  clubMembership?: boolean | null;
};

export type PublicPropertyVariant = {
  label: string | null;
  size: string | null;
  sizeUnit: string | null;
  price: string | null;
  unitsAvailable: number | null;
  bhk?: number | null;
  carpetArea?: string | null;
  carpetAreaMax?: string | null;
  carpetAreaUnit?: string | null;
  superBuiltUpArea?: string | null;
  superBuiltUpAreaMax?: string | null;
  superBuiltUpAreaUnit?: string | null;
  bathrooms?: number | null;
  charges?: PublicPropertyVariantCharges | null;
};

export type PublicPropertyFloorPlan = {
  id: string;
  path: string;
  label: string | null;
  planType: "2d" | "3d";
};

export type PublicBuilderListing = {
  avgPrice: string | number | null;
  areaUnit: string | null;
};

export type PublicPropertyProject = {
  projectName: string;
  projectType: string | null;
  developerName: string | null;
  launchDate: string | null;
  totalUnits: number | null;
  totalBlocks: number | null;
  projectAreaAcres: string | number | null;
  reraLink: string | null;
  developerStats: {
    totalProjects: number;
    ongoingProjects: number;
    completedProjects: number;
  };
  highlights: { kind: string; text: string; distance: string | null }[];
  faqs: { question: string; answer: string }[];
};

export type PublicAmenityItem = {
  name: string;
  imagePath: string;
};

export type PublicPropertyImageCategory = {
  category: string;
  images: string[];
};

export type PublicPropertyDetails = {
  id: string;
  displayPropertyId: string;
  kind: "project" | "unit";
  listing: PublicSearchListing;
  images: string[];
  imageCategories?: PublicPropertyImageCategory[];
  address: string;
  description: string;
  facing: string | null;
  availableFrom: string | null;
  constructionStatus: string | null;
  possessionDate: string | null;
  amenities: PublicAmenityItem[];
  furnishingItems: PublicAmenityItem[];
  attributes: PublicPropertyAttributes;
  pricing: PublicPropertyAttributes;
  selections: Record<string, string[]>;
  floorPlans: PublicPropertyFloorPlan[];
  brochure: string | null;
  poster: { name: string; postedBy: PublicSearchListing["postedBy"] };
  project?: PublicPropertyProject;
  builderListing?: PublicBuilderListing | null;
  variants?: PublicPropertyVariant[];
  similar: PublicSearchListing[];
};

export type PublicSearchResponse = PublicSearchListResponse & {
  otherLocalities: PublicSearchListing[];
};

export type PropertyRequirementPayload = {
  listingType: "sale" | "rent-lease";
  propertyType: string;
  city: string;
  localities: string[];
  subTypes: string[];
  requirement: string;
};

const withImageUrl = (listing: PublicSearchListing): PublicSearchListing => ({
  ...listing,
  imageUrl: listing.imageUrl ? getAssetUrl(listing.imageUrl) : null,
});

export async function searchProperties(query: string, signal?: AbortSignal) {
  const response = await apiFetch<PublicSearchResponse>(`/property-search?${query}`, {
    method: "GET",
    signal,
  });

  return {
    ...response,
    items: response.items.map(withImageUrl),
    otherLocalities: response.otherLocalities.map(withImageUrl),
  };
}

export async function getPublicPropertyDetails(id: string) {
  const { property } = await apiFetch<{ property: PublicPropertyDetails }>(`/property-search/${id}`, {
    method: "GET",
    cache: "no-store",
  });

  return {
    ...property,
    listing: withImageUrl(property.listing),
    similar: property.similar.map(withImageUrl),
    images: property.images.map(getAssetUrl),
    imageCategories: (property.imageCategories ?? []).map(({ category, images }) => ({
      category,
      images: images.map(getAssetUrl),
    })),
    brochure: property.brochure ? getAssetUrl(property.brochure) : null,
    floorPlans: property.floorPlans.map((plan) => ({ ...plan, path: getAssetUrl(plan.path) })),
  };
}

export function submitPropertyRequirement(payload: PropertyRequirementPayload, token: string) {
  return apiFetch<{ message: string }>("/property-requirements", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: payload,
  });
}
