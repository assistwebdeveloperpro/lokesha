import { apiFetch } from "./apiClient";

export type CreateAdminPropertyResponse = {
  message: string;
  property: {
    id: string;
    adminId: string;
    status: string;
    projectName: string;
  };
};

export function createAdminProperty(formData: FormData, token: string) {
  return apiFetch<CreateAdminPropertyResponse>("/master/post-property", {
    method: "POST",
    body: formData,
    headers: { Authorization: `Bearer ${token}` },
  });
}
