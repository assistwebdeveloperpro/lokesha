import { ApiError } from "@/services/apiClient";
import { recordPropertyView } from "@/services/seenProperties.service";
import { getToken } from "@/services/session";
import { addGuestView } from "./guestSeenHistory";

export type TrackViewDeps = {
  getToken: () => string | null;
  record: (propertyId: string, token: string) => Promise<unknown>;
  addGuestView: (propertyId: string) => void;
};

const defaultDeps: TrackViewDeps = {
  getToken,
  record: recordPropertyView,
  addGuestView: (propertyId) => addGuestView(propertyId),
};

// Logged-in views go to the API, guest views stay in the browser; never throws
export async function trackPropertyView(
  propertyId: string,
  deps: TrackViewDeps = defaultDeps,
): Promise<void> {
  const token = deps.getToken();
  if (!token) {
    deps.addGuestView(propertyId);
    return;
  }

  try {
    await deps.record(propertyId, token);
  } catch (error) {
    // An expired session is a guest again; the view is merged on the next login
    if (error instanceof ApiError && error.status === 401) {
      deps.addGuestView(propertyId);
    }
  }
}
