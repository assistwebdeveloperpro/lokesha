import { apiFetch } from "./apiClient";

export type Role = "buyer" | "owner" | "agent" | "builder";

export type SignupPayload = {
  role: Role;
  name: string;
  email: string;
  password: string;
  mobile_number: string;
};

export type SignupResponse = {
  message: string;
  user: {
    id: string;
    role: Role;
    name: string;
    email: string;
    mobile_number: string;
    created_at: string;
    updated_at: string;
  };
};

export type LoginPayload = {
  role: Role;
  mobile_number: string;
};

export type LoginResponse = {
  message: string;
  otp_expires_in: number;
};

export type VerifyOtpPayload = {
  mobile_number: string;
  otp: string;
};

export type VerifyOtpResponse = {
  token: string;
  role: Role;
  name: string;
};

export type MeResponse = {
  user: {
    id: string;
    role: Role;
    name: string;
    email: string;
    mobile_number: string;
    created_at: string;
    updated_at: string;
  };
};

export function signup(payload: SignupPayload) {
  return apiFetch<SignupResponse>("/user/auth/signup", {
    method: "POST",
    body: payload,
  });
}

export function login(payload: LoginPayload) {
  return apiFetch<LoginResponse>("/user/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function verifyOtp(payload: VerifyOtpPayload) {
  return apiFetch<VerifyOtpResponse>("/user/auth/verify-otp", {
    method: "POST",
    body: payload,
  });
}

export function getMe(token: string) {
  return apiFetch<MeResponse>("/user/auth/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}
