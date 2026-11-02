import { formatPriceAmount } from "@/components/user/dashboard/manage-properties/managePropertiesShared";
import {
  MOCK_PUBLIC_SEARCH_LISTINGS,
} from "@/components/landing/property-search/property-list/mockPublicSearchListings";
import type { PublicSearchListing } from "@/components/landing/property-search/property-list/publicSearchListing.types";
import { formatSearchListingArea } from "@/components/landing/property-search/property-list/formatSearchListingArea";
import { buildSearchUrl } from "@/lib/property-search-url/buildSearchUrl";
import { EMPTY_MORE_FILTERS } from "@/lib/property-search-url/moreFilters.types";
import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import type {
  FloorPlanViewType,
  PropertyDetailsProjectView,
  PropertyDetailsUnitView,
  PropertyDetailsView,
} from "./propertyDetails.types";

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80",
];

const FLOOR_PLAN_2D_IMAGES = [
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
];

const FLOOR_PLAN_3D_IMAGES = [
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
];

const FLOOR_PLAN_VIEW_TYPES: FloorPlanViewType[] = ["2d", "3d"];

function displayPropertyIdFromUuid(id: string): string {
  const numeric = Number.parseInt(id.replace(/-/g, "").slice(0, 8), 16);
  return String((numeric % 900_000) + 100_000);
}

function bedroomSummary(bedrooms: number[]): string {
  if (bedrooms.length === 0) return "—";
  return [...new Set(bedrooms)].sort((a, b) => a - b).join(", ");
}

function subTypeLabel(subType: string): string {
  return subType.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildListingSearchCriteria(
  listing: PublicSearchListing,
  localities: string[],
): PropertySearchCriteria {
  return {
    transaction: listing.listingType === "sale" ? "property-for-sale" : "property-for-rent",
    category: "residential-real-estate",
    cityName: listing.city,
    localities,
    projects: [],
    bedrooms: [],
    propertyTypes: [listing.propertySubType],
    constructionStatuses: [],
    saleTypes: [],
    occupancies: [],
    genders: [],
    postedBy: [],
    more: EMPTY_MORE_FILTERS,
    page: 1,
  };
}

function buildBreadcrumbs(listing: PublicSearchListing, currentLabel: string) {
  const city = listing.city;
  const locality = listing.locality;
  const isProject = listing.postedBy === "builder";

  return [
    { label: "Home", href: "/" },
    {
      label: isProject
        ? `Residential Projects in ${city}`
        : `Flats for Sale in ${city}`,
      href: buildSearchUrl(buildListingSearchCriteria(listing, [])),
    },
    {
      label: isProject
        ? `Residential Projects in ${locality} ${city}`
        : `Flats for Sale in ${locality}, ${city}`,
      href: buildSearchUrl(buildListingSearchCriteria(listing, [locality])),
    },
    { label: currentLabel },
  ];
}

function similarListings(currentId: string): PublicSearchListing[] {
  return MOCK_PUBLIC_SEARCH_LISTINGS.filter((item) => item.id !== currentId).slice(0, 8);
}

function buildProjectView(listing: PublicSearchListing): PropertyDetailsProjectView {
  const bhkLabel = `${bedroomSummary(listing.bedrooms)} BHK Flat/Apartment`;
  const area = formatSearchListingArea(listing);

  return {
    kind: "project",
    id: listing.id,
    displayPropertyId: displayPropertyIdFromUuid(listing.id),
    listing,
    images: listing.imageUrl ? [listing.imageUrl, ...GALLERY_IMAGES.slice(1)] : GALLERY_IMAGES,
    breadcrumbs: buildBreadcrumbs(listing, `${listing.title} in ${listing.locality} ${listing.city}`),
    pageTitle: `${listing.title} - ${bedroomSummary(listing.bedrooms)} BHK Residential Project at ${listing.locality}, ${listing.city}`,
    headlineTitle: `${listing.title} in ${listing.locality}, ${listing.city}`,
    headlineSubtitle: listing.subtitle,
    address: `${listing.title}, ${listing.locality}, ${listing.city}, Gujarat`,
    description: `${listing.title} is a thoughtfully planned residential project in ${listing.locality}, ${listing.city}. The development offers ${bhkLabel.toLowerCase()} configurations with modern amenities, strong connectivity, and a community-focused lifestyle. Ideal for end-users and investors looking for quality construction and transparent project details.`,
    amenities: [
      "Lift",
      "Gym",
      "Swimming Pool",
      "Club House",
      "Power Backup",
      "24x7 Security",
      "Children Play Area",
      "Parking",
      "Garden",
      "CCTV",
    ],
    similarListings: similarListings(listing.id),
    poster: {
      name: listing.builderName ?? listing.title,
      postedBy: listing.postedBy,
    },
    launchDate: listing.launchOrPossessionLabel ?? "—",
    possessionLabel: listing.constructionStatus === "Ready to Move" ? "Immediate" : listing.launchOrPossessionLabel ?? "—",
    reraNumber: listing.reraRegistered
      ? "PR/GJ/AHMEDABAD/AHMEDABAD CITY/Ahmedabad Municipal Corporation/MAA15562/210725/311229"
      : null,
    overviewRows: [
      { label: "Area", value: area },
      { label: "Configuration", value: bhkLabel },
      { label: "Date of Launch", value: listing.launchOrPossessionLabel ?? "—" },
      {
        label: "Date of Possession",
        value:
          listing.constructionStatus === "Ready to Move"
            ? "Immediate"
            : (listing.launchOrPossessionLabel ?? "—"),
      },
      { label: "Total Units", value: listing.totalUnits ? String(listing.totalUnits) : "—" },
      { label: "Total Blocks", value: listing.totalFloors ? String(Math.max(1, Math.ceil(listing.totalFloors / 6))) : "—" },
      {
        label: "ReraId",
        value: listing.reraRegistered
          ? "PR/GJ/AHMEDABAD/AHMEDABAD CITY/Ahmedabad Municipal Corporation/MAA15562/210725/311229"
          : "Not Available",
      },
      { label: "Available Sizes", value: area },
    ],
    bhkConfigurations: listing.bedrooms.map((bhk) => `${bhk} BHK Flat/Apartment`),
    floorPlans: listing.bedrooms.flatMap((bhk, index) => {
      const min = listing.carpetAreaMin ?? 0;
      const max = listing.carpetAreaMax ?? min;
      const areaValue = min === max ? min : Math.round(min + ((max - min) * index) / Math.max(1, listing.bedrooms.length - 1));
      const planPrice =
        listing.priceMin !== null
          ? formatPriceAmount(
              Math.round(
                listing.priceMin +
                  ((listing.priceMax ?? listing.priceMin) - listing.priceMin) *
                    (index / Math.max(1, listing.bedrooms.length - 1)),
              ),
            )
          : "Price on request";

      return FLOOR_PLAN_VIEW_TYPES.map((planType) => ({
        id: `${listing.id}-${bhk}-${planType}`,
        label: `${bhk} BHK Flat/Apartment`,
        planType,
        areaLabel: `${areaValue.toLocaleString("en-IN")} sqft`,
        areaType: "Super Built-up Area",
        priceLabel: planPrice,
        imageUrl:
          planType === "2d"
            ? FLOOR_PLAN_2D_IMAGES[index % FLOOR_PLAN_2D_IMAGES.length]
            : FLOOR_PLAN_3D_IMAGES[index % FLOOR_PLAN_3D_IMAGES.length],
      }));
    }),
    developer: {
      name: listing.builderName ?? "Developer",
      totalProjects: 12,
      ongoingProjects: 4,
      completedProjects: 8,
      description: `${listing.builderName ?? "The developer"} has delivered multiple residential projects across ${listing.city} with a focus on quality construction, timely possession, and customer-centric design.`,
    },
  };
}

function buildUnitView(listing: PublicSearchListing): PropertyDetailsUnitView {
  const bhk = listing.bedrooms[0] ?? 3;
  const carpet = listing.carpetAreaMin ?? 1285;
  const superBuiltUp = listing.carpetAreaMax ?? Math.round(carpet * 1.2);
  const price = listing.price ?? listing.priceMin ?? 68_00_000;
  const priceLabel = formatPriceAmount(price);
  const carpetRate = formatPriceAmount(Math.round(price / carpet));
  const superRate = formatPriceAmount(Math.round(price / superBuiltUp));

  return {
    kind: "unit",
    id: listing.id,
    displayPropertyId: displayPropertyIdFromUuid(listing.id),
    listing,
    images: listing.imageUrl ? [listing.imageUrl, ...GALLERY_IMAGES.slice(1)] : GALLERY_IMAGES,
    breadcrumbs: buildBreadcrumbs(
      listing,
      `${bhk} BHK Flats for sale in ${listing.title}, ${listing.locality}, ${listing.city}`,
    ),
    pageTitle: `${bhk} BHK ${subTypeLabel(listing.propertySubType)} for Sale in ${listing.title}, ${listing.locality}, ${listing.city}`,
    headlineTitle: `${priceLabel} | ${listing.title}`,
    headlineSubtitle: listing.subtitle,
    address: `${listing.title}, ${listing.locality}, ${listing.city}, Gujarat`,
    description: `Spacious ${bhk} BHK ${subTypeLabel(listing.propertySubType).toLowerCase()} available for sale in ${listing.title}, ${listing.locality}. The home offers a practical layout, good natural light, and access to daily conveniences nearby.`,
    amenities: [
      "Lift",
      "Power Backup",
      "Parking",
      "Security",
      "Water Supply",
      "Maintenance Staff",
    ],
    furnishingItems: [
      "Modular Kitchen",
      "Wardrobes",
      "Sofa",
      "Dining Table",
      "AC",
      "Geyser",
      "TV Unit",
      "Bed",
    ],
    similarListings: similarListings(listing.id),
    poster: {
      name: listing.postedBy === "dealer" ? "AKT Yash Patel" : "Verified Owner",
      postedBy: listing.postedBy,
    },
    propertyDetailRows: [
      { label: "Property Transaction", value: "Resale Property" },
      { label: "Furnishing Status", value: "Furnished" },
      { label: "Bedrooms", value: String(bhk) },
      { label: "Bathrooms", value: "2" },
      {
        label: "Super Built-up Area",
        value: `${superBuiltUp.toLocaleString("en-IN")} sq ft | ${superRate}/sq ft`,
      },
      {
        label: "Carpet Area",
        value: `${carpet.toLocaleString("en-IN")} sq ft | ${carpetRate}/sq ft`,
      },
      { label: "Property Age", value: "2 to 3 years" },
      { label: "Floor Number", value: "6 out of 7" },
      { label: "Balconies", value: "2" },
      { label: "Facing", value: "East" },
    ],
    pricingRows: [
      { label: "Expected Price", value: priceLabel },
      { label: "Booking Amount", value: formatPriceAmount(1_00_000) },
      { label: "Maintenance Charges", value: "₹ 5,000" },
      { label: "Car Parking", value: "1 Covered" },
    ],
  };
}

export function getMockPropertyDetails(id: string): PropertyDetailsView | null {
  const listing = MOCK_PUBLIC_SEARCH_LISTINGS.find((item) => item.id.toLowerCase() === id.toLowerCase());
  if (!listing) return null;

  if (listing.postedBy === "builder") {
    return buildProjectView(listing);
  }

  return buildUnitView(listing);
}
