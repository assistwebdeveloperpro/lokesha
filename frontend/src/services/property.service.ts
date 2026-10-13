import { apiFetch } from "./apiClient";

export type PropertyStatus = "draft" | "pending" | "published" | "rejected";

export type PropertySummary = {
  id: string;
  status: PropertyStatus;
  listingType: string;
  propertyType: string;
  propertySubType: string | null;
  societyName: string;
  locality: string;
  city: string | null;
  state: string;
  carpetArea: number | null;
  carpetAreaUnit: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  expectedPrice: number | null;
  monthlyRent: number | null;
  mainImage: string | null;
  createdAt: string;
};

export type PropertyMedia = {
  id: string;
  category: string;
  mediaType: "image" | "video";
  filePath: string;
  originalName: string | null;
  sortOrder: number;
};

export type PropertyDetail = {
  id: string;
  status: PropertyStatus;
  listingType: string;
  propertyType: string;
  propertySubType: string | null;
  address: {
    blockNo: string | null;
    flatNumber: string | null;
    societyName: string;
    locality: string;
    addressLine2: string | null;
    landmark: string | null;
    pinCode: string;
    city: string | null;
    state: string;
    propertyDescription: string;
  };
  details: {
    carpetArea: number | null;
    carpetAreaUnit: string | null;
    superBuildUpArea: number | null;
    superBuildUpUnit: string | null;
    propertyTransaction: string | null;
    constructionStatus: string | null;
    possessionDate: string | null;
    ageOfConstruction: string | null;
    fullHouse: boolean;
    sharingBasis: boolean;
    availableFrom: string | null;
    interiorModificationAllowed: boolean;
    tenantPreferences: string[];
    bedrooms: number | null;
    balconies: number | null;
    totalFloors: number | null;
    floorNumber: number | null;
    bathrooms: number | null;
    lift: number | null;
  };
  amenities: {
    furnishingStatus: string | null;
    furnishing: string[];
    amenities: string[];
    facing: string | null;
    carParkingAvailable: boolean;
    carParking: number | null;
    clubMembership: boolean;
    reraNumber: string | null;
    openSides: number | null;
  };
  pricing: {
    expectedPrice: number | null;
    priceInclusion: string[];
    priceNegotiable: boolean;
    transferFee: number | null;
    bookingAmount: number | null;
    monthlyRent: number | null;
    noticePeriod: number | null;
    depositAmount: number | null;
    maintenanceCharges: number | null;
    benefitsRemarks: string | null;
  };
  brochurePath: string | null;
  media: PropertyMedia[];
  createdAt: string;
  updatedAt: string;
};

export type CreatePropertyResponse = {
  message: string;
  property: PropertyDetail;
};

export type MyPropertiesResponse = {
  properties: PropertySummary[];
  page: number;
  limit: number;
  total: number;
};

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function createProperty(formData: FormData, token: string) {
  return apiFetch<CreatePropertyResponse>("/property", {
    method: "POST",
    body: formData,
    headers: authHeaders(token),
  });
}

export function getMyProperties(
  token: string,
  { page, limit }: { page: number; limit: number },
) {
  return apiFetch<MyPropertiesResponse>(
    `/property/me?page=${page}&limit=${limit}`,
    { headers: authHeaders(token) },
  );
}

export function getPropertyById(id: string, token: string) {
  return apiFetch<{ property: PropertyDetail }>(`/property/${id}`, {
    headers: authHeaders(token),
  });
}

export function updateProperty(id: string, payload: unknown, token: string) {
  return apiFetch<CreatePropertyResponse>(`/property/${id}`, {
    method: "PUT",
    body: payload,
    headers: authHeaders(token),
  });
}

export function addPropertyMedia(id: string, formData: FormData, token: string) {
  return apiFetch<CreatePropertyResponse>(`/property/${id}/media`, {
    method: "POST",
    body: formData,
    headers: authHeaders(token),
  });
}

export function deletePropertyMedia(id: string, mediaId: string, token: string) {
  return apiFetch<{ message: string }>(`/property/${id}/media/${mediaId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export function deleteProperty(id: string, token: string) {
  return apiFetch<{ message: string }>(`/property/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}
