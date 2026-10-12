import { apiFetch } from "./apiClient";

export type CreatePropertyResponse = {
  message: string;
  property: { id: string; [key: string]: unknown };
};

export function createProperty(formData: FormData, token: string) {
  return apiFetch<CreatePropertyResponse>("/property", {
    method: "POST",
    body: formData,
    headers: { Authorization: `Bearer ${token}` },
  });
}
