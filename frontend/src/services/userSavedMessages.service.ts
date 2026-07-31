import { apiFetch } from "./apiClient";

export type SavedMessageCategory = "property" | "requirements" | "agents" | "builders";

export type SavedMessagesMap = Record<SavedMessageCategory, string>;

export type GetSavedMessagesResponse = {
  savedMessages: SavedMessagesMap;
};

export function getSavedMessages(token: string) {
  return apiFetch<GetSavedMessagesResponse>("/user/saved-messages/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export type SaveMessagePayload = {
  category: SavedMessageCategory;
  message: string;
};

export type SaveMessageResponse = {
  message: string;
  savedMessages: SavedMessagesMap;
};

export function saveMessage(payload: SaveMessagePayload, token: string) {
  return apiFetch<SaveMessageResponse>("/user/saved-messages", {
    method: "POST",
    body: payload,
    headers: { Authorization: `Bearer ${token}` },
  });
}
