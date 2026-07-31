import { apiFetch } from "./apiClient";

export type OfficeDetailsResponse = {
  message: string;
  officeDetails: {
    id: string;
    user_id: string;
    [key: string]: unknown;
  };
};

export type OfficeDetails = {
  id: string;
  user_id: string;
  state: string;
  city: string;
  locality: string;
  address: string | null;
  postal_code: string | null;
  contact_person_name: string;
  hide_person_name: boolean;
  agency_company_name: string;
  company_website: string | null;
  office_photos: string[] | null;
  contact_person_photo: string | null;
  created_at: string;
  updated_at: string;
};

export type GetOfficeDetailsResponse = {
  officeDetails: OfficeDetails;
};

export function saveOfficeDetails(formData: FormData, token: string) {
  return apiFetch<OfficeDetailsResponse>("/user/office", {
    method: "POST",
    body: formData,
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getOfficeDetails(token: string) {
  return apiFetch<GetOfficeDetailsResponse>("/user/office/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function uploadContactPersonPhoto(file: File, token: string) {
  const formData = new FormData();
  formData.append("contactPersonPhoto", file);

  return apiFetch<OfficeDetailsResponse>("/user/office/contact-person-photo", {
    method: "POST",
    body: formData,
    headers: { Authorization: `Bearer ${token}` },
  });
}
