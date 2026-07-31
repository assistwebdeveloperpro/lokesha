import { apiFetch } from "./apiClient";

export type BusinessClientPayload = {
  name: string;
  dealValue: string;
};

export type BusinessDetailsPayload = {
  dealingIn: string[];
  propertyType: string[];
  transactionType: string[];
  transactionTypeOthers?: string[];
  residentialProperty?: string[];
  residentialPropertyOthers?: string[];
  commercialProperty?: string[];
  commercialPropertyOthers?: string[];
  operatingSince: string;
  expertiseIn: string;
  businessDescription: string;
  authorizedAgents?: string;
  propertyRegistry?: "yes" | "no";
  loanFacility?: "yes" | "no";
  clients?: BusinessClientPayload[];
};

export type BusinessDetailsResponse = {
  message: string;
  businessDetails: {
    id: string;
    user_id: string;
    [key: string]: unknown;
  };
};

export type BusinessClient = {
  id: string;
  name: string | null;
  deal_value: string | null;
  created_at: string;
};

export type BusinessDetails = {
  id: string;
  user_id: string;
  dealing_in: string[];
  property_type: string[];
  transaction_type: string[];
  residential_property: string[];
  commercial_property: string[];
  operating_since: number;
  expertise_in: string;
  business_description: string;
  authorized_agents: string | null;
  property_registry: boolean | null;
  loan_facility: boolean | null;
  clients: BusinessClient[];
  created_at: string;
  updated_at: string;
};

export type GetBusinessDetailsResponse = {
  businessDetails: BusinessDetails;
};

export function saveBusinessDetails(payload: BusinessDetailsPayload, token: string) {
  return apiFetch<BusinessDetailsResponse>("/user/company", {
    method: "POST",
    body: payload,
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getBusinessDetails(token: string) {
  return apiFetch<GetBusinessDetailsResponse>("/user/company/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function uploadCompanyLogo(file: File, token: string) {
  const formData = new FormData();
  formData.append("companyLogo", file);

  return apiFetch<BusinessDetailsResponse>("/user/company/company-logo", {
    method: "POST",
    body: formData,
    headers: { Authorization: `Bearer ${token}` },
  });
}
