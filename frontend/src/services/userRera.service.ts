import { apiFetch } from "./apiClient";

export type ReraDetail = {
  id: string;
  user_id: string;
  state: string;
  rera_id: string;
  validity_month: string;
  validity_year: string;
  verification_link: string | null;
  document_path: string;
  document_original_name: string;
  created_at: string;
  updated_at: string;
};

export type GetReraDetailsResponse = {
  reraDetails: ReraDetail[];
};

export type ReraDetailResponse = {
  message: string;
  reraDetail: ReraDetail;
};

export function getReraDetails(token: string) {
  return apiFetch<GetReraDetailsResponse>("/user/rera", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createReraDetail(formData: FormData, token: string) {
  return apiFetch<ReraDetailResponse>("/user/rera", {
    method: "POST",
    body: formData,
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateReraDetail(id: string, formData: FormData, token: string) {
  return apiFetch<ReraDetailResponse>(`/user/rera/${id}`, {
    method: "PUT",
    body: formData,
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function deleteReraDetail(id: string, token: string) {
  return apiFetch<{ message: string }>(`/user/rera/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
