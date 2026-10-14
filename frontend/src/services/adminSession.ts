const ADMIN_TOKEN_KEY = "lokesha_admin_token";

export const ADMIN_SESSION_CHANGE_EVENT = "lokesha:admin-session-change";

function notifyAdminSessionChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ADMIN_SESSION_CHANGE_EVENT));
  }
}

export function setAdminSession(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  notifyAdminSessionChange();
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  notifyAdminSessionChange();
}
