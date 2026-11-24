import { cache } from "react";
import { ApiError } from "@/services/apiClient";
import {
  getPublicPropertyDetails,
  getPublicPropertyDetailsByShortCode,
  type PublicPropertyDetails,
} from "@/services/propertySearch.service";
import { buildPropertyDetailsView } from "./buildPropertyDetailsView";

// A missing or unpublished property is null; cache lets metadata and page share one request
async function loadView(fetchDetails: () => Promise<PublicPropertyDetails>) {
  try {
    return buildPropertyDetailsView(await fetchDetails());
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export const loadPropertyDetailsById = cache((id: string) =>
  loadView(() => getPublicPropertyDetails(id)),
);

export const loadPropertyDetailsByShortCode = cache((shortCode: string) =>
  loadView(() => getPublicPropertyDetailsByShortCode(shortCode)),
);
