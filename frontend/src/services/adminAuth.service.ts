import { apiFetch } from "./apiClient";

export type AdminLoginPayload = {
  mobile_number: string;
};

export type AdminLoginResponse = {
  message: string;
  otp_expires_in: number;
};

export type AdminVerifyOtpPayload = {
  mobile_number: string;
  otp: string;
};

export type AdminVerifyOtpResponse = {
  token: string;
  name: string;
};

export type AdminMeResponse = {
  admin: {
    id: string;
    name: string;
    mobile_number: string;
    created_at: string;
    updated_at: string;
  };
};

export function adminLogin(payload: AdminLoginPayload) {
  return apiFetch<AdminLoginResponse>("/master/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function adminVerifyOtp(payload: AdminVerifyOtpPayload) {
  return apiFetch<AdminVerifyOtpResponse>("/master/auth/verify-otp", {
    method: "POST",
    body: payload,
  });
}

export function getAdminMe(token: string) {
  return apiFetch<AdminMeResponse>("/master/auth/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}
