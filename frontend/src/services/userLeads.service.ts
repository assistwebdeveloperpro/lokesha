import { apiFetch } from "./apiClient";
import type { PropertyContactRole } from "./propertyContact.service";
import type { ActivityProperty } from "./userPropertyActivity.types";

export type UserLead = {
  id: string;
  sentAt: string;
  isNew: boolean;
  enquiryDate: string;
  enquirer: { name: string; mobile: string | null; email: string | null };
  phoneRevealed: boolean;
  contactRole: PropertyContactRole;
  isAvailable: boolean;
  property: ActivityProperty;
};

export type UserLeadsQuery = {
  page: number;
  limit: number;
  // Moves the list to the page that holds this lead
  leadId?: string;
};

export type UserLeadsResponse = {
  items: UserLead[];
  page: number;
  limit: number;
  total: number;
};

export function fetchUserLeads(query: UserLeadsQuery, token: string) {
  const params = new URLSearchParams({ page: String(query.page), limit: String(query.limit) });
  if (query.leadId) params.set("leadId", query.leadId);

  return apiFetch<UserLeadsResponse>(`/user/leads?${params.toString()}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}
