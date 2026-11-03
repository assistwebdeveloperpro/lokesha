const REDIRECT_KEY = "lokesha_post_login_redirect";

// Only same-site paths are kept, so the stored value can never send the user elsewhere
const isSafePath = (path: string) => path.startsWith("/") && !path.startsWith("//");

export function setPostLoginRedirect(path: string) {
  if (!isSafePath(path)) return;

  try {
    sessionStorage.setItem(REDIRECT_KEY, path);
  } catch {
    // Storage can be blocked; the user then lands on the default page after login
  }
}

export function consumePostLoginRedirect(): string | null {
  try {
    const path = sessionStorage.getItem(REDIRECT_KEY);
    sessionStorage.removeItem(REDIRECT_KEY);
    return path && isSafePath(path) ? path : null;
  } catch {
    return null;
  }
}
