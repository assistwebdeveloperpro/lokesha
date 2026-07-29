import type { Role } from "./auth.service";

const TOKEN_KEY = "lokesha_token";
const ROLE_KEY = "lokesha_role";

export const SESSION_CHANGE_EVENT = "lokesha:session-change";

function notifySessionChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
  }
}

export function setSession(token: string, role: Role) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  localStorage.removeItem("lokesha_name");
  notifySessionChange();
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRole(): Role | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ROLE_KEY) as Role | null;
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem("lokesha_name");
  notifySessionChange();
}
