type PendingToastType = "success" | "error";

type PendingToast = {
  message: string;
  type: PendingToastType;
};

const PENDING_TOAST_KEY = "lokesha:pending-toast";

export function setPendingToast(
  message: string,
  type: PendingToastType = "success",
) {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.setItem(
    PENDING_TOAST_KEY,
    JSON.stringify({ message, type } satisfies PendingToast),
  );
}

export function consumePendingToast(): PendingToast | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = sessionStorage.getItem(PENDING_TOAST_KEY);
  if (!raw) {
    return null;
  }
  sessionStorage.removeItem(PENDING_TOAST_KEY);
  try {
    const parsed = JSON.parse(raw) as PendingToast;
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
