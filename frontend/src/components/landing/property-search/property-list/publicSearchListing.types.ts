export type PublicSearchPostedBy = "builder" | "owner" | "dealer";

export type PublicSearchListing = {
  id: string;
  title: string;
  subtitle: string;
  categoryLabel: string;
  imageUrl: string | null;
  listingType: "sale" | "rent-lease";
  price: number | null;
  priceMin: number | null;
  priceMax: number | null;
  carpetAreaMin: number | null;
  carpetAreaMax: number | null;
  carpetAreaUnit: string;
  bedrooms: number[];
  propertySubType: string;
  propertyType: string;
  locality: string;
  city: string;
  constructionStatus: string | null;
  launchOrPossessionLabel: string | null;
  totalUnits: number | null;
  totalFloors: number | null;
  postedBy: PublicSearchPostedBy;
  reraRegistered: boolean;
  builderName: string | null;
  hasBrochure: boolean;
};

export type PublicSearchListResponse = {
  items: PublicSearchListing[];
  page: number;
  pageSize: number;
  total: number;
};
