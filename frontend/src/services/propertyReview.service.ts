import { apiFetch } from "./apiClient";
import type {
  PropertyDetailResponse,
  PropertyListItem,
  PropertyStatus,
  PropertyStatusResult,
} from "./property.service";

export type ReviewOwner = { name: string; email: string; mobile: string };

export type ReviewListItem = PropertyListItem & { owner: ReviewOwner };

export type ReviewStatus = Exclude<PropertyStatus, "draft">;

export type ReviewListQuery = {
  page?: number;
  limit?: number;
  status?: ReviewStatus;
};

export type ReviewListResponse = {
  items: ReviewListItem[];
  page: number;
  limit: number;
  total: number;
};

export type ReviewDetailResponse = PropertyDetailResponse & { owner: ReviewOwner };

const BASE_PATH = "/master/property-review";

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

export function getReviewProperties(query: ReviewListQuery, token: string) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });

  return apiFetch<ReviewListResponse>(`${BASE_PATH}?${params.toString()}`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export function getReviewProperty(id: string, token: string) {
  return apiFetch<ReviewDetailResponse>(`${BASE_PATH}/${id}`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export function approveReviewProperty(id: string, token: string) {
  return apiFetch<PropertyStatusResult>(`${BASE_PATH}/${id}/approve`, {
    method: "POST",
    headers: authHeaders(token),
  });
}

export function rejectReviewProperty(id: string, reason: string, token: string) {
  return apiFetch<PropertyStatusResult>(`${BASE_PATH}/${id}/reject`, {
    method: "POST",
    body: { reason },
    headers: authHeaders(token),
  });
}
