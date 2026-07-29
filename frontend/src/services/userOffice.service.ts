import { apiFetch } from "./apiClient";

export type OfficeDetailsResponse = {
  message: string;
  officeDetails: {
    id: string;
    user_id: string;
    [key: string]: unknown;
  };
};

export function saveOfficeDetails(formData: FormData, token: string) {
  return apiFetch<OfficeDetailsResponse>("/user/office", {
    method: "POST",
    body: formData,
    headers: { Authorization: `Bearer ${token}` },
  });
}
