type RedirectToastType = "success" | "error";

type RedirectToast = {
  message: string;
  type: RedirectToastType;
};

const REDIRECT_TOAST_KEY = "lokesha:redirect-toast";

export function setRedirectToast(
  message: string,
  type: RedirectToastType = "success",
) {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.setItem(
    REDIRECT_TOAST_KEY,
    JSON.stringify({ message, type } satisfies RedirectToast),
  );
}

export function consumeRedirectToast(): RedirectToast | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = sessionStorage.getItem(REDIRECT_TOAST_KEY);
  if (!raw) {
    return null;
  }
  sessionStorage.removeItem(REDIRECT_TOAST_KEY);
  try {
    const parsed = JSON.parse(raw) as RedirectToast;
    if (typeof parsed.message !== "string") {
      return null;
    }
    return {
      message: parsed.message,
      type: parsed.type === "error" ? "error" : "success",
    };
  } catch {
    return null;
  }
}
