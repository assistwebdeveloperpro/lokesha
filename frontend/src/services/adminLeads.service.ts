import { apiFetch } from "./apiClient";
import type { PropertyContactRole } from "./propertyContact.service";

export type LeadVerificationStatus = "not_verified" | "verified";
export type LeadDistributionStatus = "not_sent" | "sent";

export type AdminLead = {
  id: string;
  lead: { name: string; mobile: string | null; email: string | null };
  property: {
    id: string;
    title: string;
    listingNumber: number;
    propertyType: string;
    listingType: string;
    locality: string;
    city: string | null;
  };
  lister: { name: string | null; mobile: string | null; listedBy: string | null };
  contactRole: PropertyContactRole;
  phoneRevealed: boolean;
  verificationStatus: LeadVerificationStatus;
  distributionStatus: LeadDistributionStatus;
  sentAt: string | null;
  canSendToLister: boolean;
  createdAt: string;
};

export type SentLeadResult = {
  id: string;
  distributionStatus: LeadDistributionStatus;
  sentAt: string;
};

export type AdminLeadsQuery = {
  page: number;
  limit: number;
  search?: string;
  role?: PropertyContactRole;
  phoneRevealed?: boolean;
  leadId?: string;
};

export type AdminLeadsResponse = {
  items: AdminLead[];
  page: number;
  limit: number;
  total: number;
};

export function fetchAdminLeads(query: AdminLeadsQuery, token: string) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });

  return apiFetch<AdminLeadsResponse>(`/master/leads?${params.toString()}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function sendLeadToLister(id: string, token: string) {
  return apiFetch<SentLeadResult>(`/master/leads/${id}/send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}
