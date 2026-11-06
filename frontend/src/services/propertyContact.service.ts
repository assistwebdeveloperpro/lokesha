import { apiFetch } from "./apiClient";

export type PropertyContactRole = "owner" | "agent" | "builder";

export type PropertyContactPayload = {
  propertyId: string;
  contactRole: PropertyContactRole;
};

export type PropertyContactResult = {
  contactName: string;
  contactPhone: string | null;
  phoneRevealed: boolean;
  creditBalance: number;
  canSubscribe: boolean;
};

export type ContactedPropertiesResult = {
  propertyIds: string[];
};

export function fetchContactedPropertyIds(token: string) {
  return apiFetch<ContactedPropertiesResult>("/property-contact/contacted", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function contactPropertyLister(payload: PropertyContactPayload, token: string) {
  return apiFetch<PropertyContactResult>("/property-contact", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: payload,
  });
}
