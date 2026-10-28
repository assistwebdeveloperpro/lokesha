import { apiFetch, apiFetchBlob } from "./apiClient";

export type PropertyStatus = "draft" | "pending" | "published" | "rejected" | "closed";

export type PropertySummary = {
  id: string;
  status: PropertyStatus;
  listingType: string;
  propertyType: string;
  propertySubType: string | null;
  projectName: string;
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
    projectName: string;
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

// ---------------------------------------------------------------------------
// Post property API: drafts, files, listings (backend: /api/property)
// ---------------------------------------------------------------------------

export type PayloadFields = Record<string, unknown>;

export type PayloadFileRef = { path: string; originalName?: string };

export type PropertyVariantPayload = {
  label?: string;
  size?: number;
  sizeUnit?: string;
  price?: number;
  unitsAvailable?: number;
  details?: PayloadFields;
  charges?: PayloadFields;
};

export type PropertyProjectPayload = {
  projectName: string;
  highlights?: Array<{ text: string }>;
  primeLocations?: Array<{ text: string; distance?: string }>;
  faqs?: Array<{ question: string; answer: string }>;
  [field: string]: unknown;
};

export type PropertyListingPayload = {
  // Only on a loaded property: the stored property of this sub type
  propertyId?: string;
  propertySubType: string;
  description: string;
  facing?: string;
  availableFrom?: string;
  construction?: { status?: string; possessionDate?: string };
  details?: PayloadFields;
  plotDetails?: PayloadFields;
  pricing: PayloadFields;
  selections?: Record<string, string[]>;
  amenities?: { amenities: string[]; furnishing: string[] };
  variants?: PropertyVariantPayload[];
  builder?: {
    listing?: PayloadFields;
    specifications?: Array<{ groupTitle: string; label: string; value: string; isCustom?: boolean }>;
  };
  files?: {
    media?: Array<PayloadFileRef & { category: string }>;
    floorPlans?: Array<PayloadFileRef & { label?: string; planType?: string }>;
    brochure?: PayloadFileRef;
  };
};

export type PropertyPayload = {
  listingType: string;
  propertyType: string;
  postingAs?: "builder";
  address: PayloadFields;
  project?: PropertyProjectPayload;
  listings: PropertyListingPayload[];
};

export type DraftFileKind = "media" | "floor-plan" | "brochure";

export type DraftFile = {
  id: string;
  path: string;
  kind: DraftFileKind;
  category: string | null;
  planType: string | null;
  label: string | null;
  originalName: string;
  mimeType: string;
  size: number;
};

export type DraftFormSummary = {
  listingType?: string;
  propertyType?: string;
  subTypes?: string[];
  locality?: string;
};

// The server keeps form data as is; the form owns its shape and version
export type DraftFormData = { version?: number; summary?: DraftFormSummary } & Record<string, unknown>;

export type DraftSummary = {
  id: string;
  listedBy: string;
  currentStep: number;
  summary: DraftFormSummary | null;
  createdAt: string;
  updatedAt: string;
};

export type DraftDetail = {
  id: string;
  listedBy: string;
  currentStep: number;
  formData: DraftFormData;
  createdAt: string;
  updatedAt: string;
};

export type SaveDraftInput = { currentStep: number; formData: DraftFormData };

export type CompleteDraftResult = {
  message: string;
  projectId: string | null;
  properties: Array<{ id: string; listingNumber: number; status: PropertyStatus }>;
};

export type PropertyListItem = {
  id: string;
  listingNumber: number;
  title: string;
  projectName: string | null;
  price: number | null;
  // Lowest and highest price across the sub types posted together
  priceMin: number | null;
  priceMax: number | null;
  status: PropertyStatus;
  listingType: string;
  propertyType: string;
  subType: { slug: string; name: string };
  subTypes: { slug: string; name: string }[];
  city: string | null;
  mainImage: string | null;
  // Only set for rejected properties
  rejectionReason?: string | null;
  createdAt: string;
};

export type PropertyListQuery = {
  page?: number;
  limit?: number;
  status?: PropertyStatus;
  listingType?: string;
  propertyType?: string;
};

export type PropertyListResponse = {
  items: PropertyListItem[];
  page: number;
  limit: number;
  total: number;
};

export type PropertyFile = {
  id: string;
  path: string;
  originalName: string | null;
  mimeType: string;
  size: number;
};

export type PropertyMediaFileDto = PropertyFile & {
  category: string;
  mediaType: "image" | "video" | "document";
};

export type PropertyFloorPlanDto = PropertyFile & {
  label: string | null;
  planType: string;
};

export type PropertyDetailResponse = {
  property: {
    id: string;
    listingNumber: number;
    status: PropertyStatus;
    title: string;
    price: number | null;
    rejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
  };
  payload: PropertyPayload;
  media: PropertyMediaFileDto[];
  floorPlans: PropertyFloorPlanDto[];
  // The files of every sub type, in the order of payload.listings
  listingFiles: Array<{ propertyId: string; media: PropertyMediaFileDto[]; floorPlans: PropertyFloorPlanDto[] }>;
  // Only sent to admins, who can open listings from anyone
  source?: "admin" | "user";
};

export type PropertyStatusResult = { message: string; id: string; status: PropertyStatus };

export type DraftFileMeta = {
  category?: string;
  planType?: string;
  label?: string;
};

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

// The admin panel posts through its own endpoints but shares the same payloads
export type PropertyScope = "user" | "admin";

const SCOPE_BASE_PATH: Record<PropertyScope, string> = {
  user: "/property",
  admin: "/master/post-property",
};

function buildFileFormData(file: File, meta: DraftFileMeta) {
  const formData = new FormData();
  formData.append("file", file);
  Object.entries(meta).forEach(([key, value]) => {
    if (value) formData.append(key, value);
  });
  return formData;
}

export function createDraft(input: Partial<SaveDraftInput>, token: string, scope: PropertyScope = "user") {
  return apiFetch<{ draft: DraftDetail }>(`${SCOPE_BASE_PATH[scope]}/drafts`, {
    method: "POST",
    body: input,
    headers: authHeaders(token),
  });
}

export function listDrafts(token: string, scope: PropertyScope = "user") {
  return apiFetch<{ drafts: DraftSummary[] }>(`${SCOPE_BASE_PATH[scope]}/drafts`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export function getDraft(id: string, token: string, scope: PropertyScope = "user") {
  return apiFetch<{ draft: DraftDetail }>(`${SCOPE_BASE_PATH[scope]}/drafts/${id}`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export function saveDraft(id: string, input: SaveDraftInput, token: string, scope: PropertyScope = "user") {
  return apiFetch<{ draft: { id: string; currentStep: number; updatedAt: string } }>(
    `${SCOPE_BASE_PATH[scope]}/drafts/${id}`,
    { method: "PUT", body: input, headers: authHeaders(token) },
  );
}

export function deleteDraft(id: string, token: string, scope: PropertyScope = "user") {
  return apiFetch<{ message: string }>(`${SCOPE_BASE_PATH[scope]}/drafts/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export function uploadDraftFile(
  draftId: string,
  file: File,
  kind: DraftFileKind,
  meta: DraftFileMeta,
  token: string,
  scope: PropertyScope = "user",
) {
  return apiFetch<{ file: DraftFile }>(`${SCOPE_BASE_PATH[scope]}/drafts/${draftId}/files?kind=${kind}`, {
    method: "POST",
    body: buildFileFormData(file, meta),
    headers: authHeaders(token),
  });
}

export function deleteDraftFile(draftId: string, fileName: string, token: string, scope: PropertyScope = "user") {
  return apiFetch<{ message: string }>(`${SCOPE_BASE_PATH[scope]}/drafts/${draftId}/files/${fileName}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

// Draft files are private, so previews are fetched with the token and shown from a blob URL
export async function fetchDraftFilePreview(
  draftId: string,
  fileName: string,
  token: string,
  scope: PropertyScope = "user",
) {
  const blob = await apiFetchBlob(`${SCOPE_BASE_PATH[scope]}/drafts/${draftId}/files/${fileName}`, token);
  return URL.createObjectURL(blob);
}

export function completeDraft(
  draftId: string,
  payload: PropertyPayload,
  options: { submit: boolean },
  token: string,
  scope: PropertyScope = "user",
) {
  return apiFetch<CompleteDraftResult>(`${SCOPE_BASE_PATH[scope]}/drafts/${draftId}/complete`, {
    method: "POST",
    body: { payload, submit: options.submit },
    headers: authHeaders(token),
  });
}

export type AmenityOptionDto = { key: string; name: string; imagePath: string };

export type AmenityOptionsResponse = {
  amenities: AmenityOptionDto[];
  furnishing: AmenityOptionDto[];
};

export type AmenityOptionsQuery = {
  listingType: string;
  propertyType: string;
  // Property types without sub types (PG) send none
  subType?: string;
};

export function getAmenityOptions(query: AmenityOptionsQuery, token: string, scope: PropertyScope = "user") {
  const params = new URLSearchParams({
    listingType: query.listingType,
    propertyType: query.propertyType,
    ...(query.subType && { subType: query.subType }),
  });

  return apiFetch<AmenityOptionsResponse>(`${SCOPE_BASE_PATH[scope]}/amenities?${params.toString()}`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export function getMyProperties(query: PropertyListQuery, token: string) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const search = params.toString();

  return apiFetch<PropertyListResponse>(`/property/me${search ? `?${search}` : ""}`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export function getPropertyById(id: string, token: string, scope: PropertyScope = "user") {
  return apiFetch<PropertyDetailResponse>(`${SCOPE_BASE_PATH[scope]}/${id}`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export function updateProperty(id: string, payload: PropertyPayload, token: string, scope: PropertyScope = "user") {
  return apiFetch<PropertyStatusResult>(`${SCOPE_BASE_PATH[scope]}/${id}`, {
    method: "PUT",
    body: { payload },
    headers: authHeaders(token),
  });
}

// Admin listings are published right away, so there is no review submit for them
export function submitProperty(id: string, token: string, scope: PropertyScope = "user") {
  const action = scope === "admin" ? "publish" : "submit";
  return apiFetch<PropertyStatusResult>(`${SCOPE_BASE_PATH[scope]}/${id}/${action}`, {
    method: "POST",
    headers: authHeaders(token),
  });
}

export function closeProperty(id: string, token: string, scope: PropertyScope = "user") {
  return apiFetch<PropertyStatusResult>(`${SCOPE_BASE_PATH[scope]}/${id}/close`, {
    method: "POST",
    headers: authHeaders(token),
  });
}

export function deleteProperty(id: string, token: string, scope: PropertyScope = "user") {
  return apiFetch<{ message: string }>(`${SCOPE_BASE_PATH[scope]}/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export function uploadPropertyMedia(
  id: string,
  file: File,
  kind: "media" | "brochure",
  meta: DraftFileMeta,
  token: string,
  scope: PropertyScope = "user",
) {
  return apiFetch<{ media: PropertyMediaFileDto; status: PropertyStatus }>(
    `${SCOPE_BASE_PATH[scope]}/${id}/media?kind=${kind}`,
    { method: "POST", body: buildFileFormData(file, meta), headers: authHeaders(token) },
  );
}

export function deletePropertyMedia(id: string, mediaId: string, token: string, scope: PropertyScope = "user") {
  return apiFetch<{ message: string; status: PropertyStatus }>(`${SCOPE_BASE_PATH[scope]}/${id}/media/${mediaId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export function uploadPropertyFloorPlan(
  id: string,
  file: File,
  meta: DraftFileMeta,
  token: string,
  scope: PropertyScope = "user",
) {
  return apiFetch<{ floorPlan: PropertyFloorPlanDto; status: PropertyStatus }>(
    `${SCOPE_BASE_PATH[scope]}/${id}/floor-plans`,
    { method: "POST", body: buildFileFormData(file, meta), headers: authHeaders(token) },
  );
}

export function deletePropertyFloorPlan(id: string, planId: string, token: string, scope: PropertyScope = "user") {
  return apiFetch<{ message: string; status: PropertyStatus }>(`${SCOPE_BASE_PATH[scope]}/${id}/floor-plans/${planId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}
