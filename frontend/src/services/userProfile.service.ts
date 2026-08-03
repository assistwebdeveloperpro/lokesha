import { apiFetch } from "./apiClient";
import type { Role } from "./auth.service";

export type ProfileDetails = {
  id: string;
  role: Role;
  name: string;
  email: string;
  mobile_number: string;
  mobile_country_code: string;
  alternate_email: string | null;
  receive_on_alternate_email: boolean;
  receive_sms_on_mobile: boolean;
  display_country_code: string | null;
  display_number: string | null;
  is_primary_mobile_virtual: boolean;
  hide_contact_details: boolean;
  agreed_to_terms: boolean;
  whatsapp_number: string | null;
  city: string | null;
  company_name: string | null;
  company_logo: string | null;
  contact_person_photo: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileResponse = {
  profile: ProfileDetails;
};

export function getProfileDetails(token: string) {
  return apiFetch<ProfileResponse>("/user/profile/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export type UpdateLoginDetailsPayload = {
  name: string;
  alternateEmail?: string;
  receiveOnAlternateEmail: boolean;
  mobileCountryCode: string;
  mobile: string;
  receiveSmsOnMobile: boolean;
  displayCountryCode?: string;
  displayNumber?: string;
  isPrimaryMobileVirtual: boolean;
  hideContactDetails: boolean;
  agreedToTerms: boolean;
};

export type UpdateLoginDetailsResponse = {
  message: string;
  profile: ProfileDetails;
};

export function updateLoginDetails(payload: UpdateLoginDetailsPayload, token: string) {
  return apiFetch<UpdateLoginDetailsResponse>("/user/profile/login-details", {
    method: "PUT",
    body: payload,
    headers: { Authorization: `Bearer ${token}` },
  });
}

export type UpdateWhatsappNumberPayload = {
  whatsappNumber: string;
};

export type UpdateWhatsappNumberResponse = {
  message: string;
  profile: ProfileDetails;
};

export function updateWhatsappNumber(
  payload: UpdateWhatsappNumberPayload,
  token: string,
) {
  return apiFetch<UpdateWhatsappNumberResponse>("/user/profile/whatsapp-number", {
    method: "PUT",
    body: payload,
    headers: { Authorization: `Bearer ${token}` },
  });
}
