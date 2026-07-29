import { apiFetch } from "./apiClient";
import type { Role } from "./auth.service";

export type ProfileDetails = {
  id: string;
  role: Role;
  name: string;
  email: string;
  mobile_number: string;
  city: string | null;
  company_name: string | null;
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
