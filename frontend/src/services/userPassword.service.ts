import { apiFetch } from "./apiClient";

export type ChangePasswordPayload = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ChangePasswordResponse = {
  message: string;
};

export function changePassword(payload: ChangePasswordPayload, token: string) {
  return apiFetch<ChangePasswordResponse>("/user/password/change", {
    method: "POST",
    body: payload,
    headers: { Authorization: `Bearer ${token}` },
  });
}
