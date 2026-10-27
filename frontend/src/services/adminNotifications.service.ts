import { apiFetch } from "./apiClient";
import type { NotificationListQuery, NotificationListResponse } from "./userNotifications.service";

const BASE_PATH = "/master/notifications";

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

export function getAdminNotifications(query: NotificationListQuery, token: string) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });

  return apiFetch<NotificationListResponse>(`${BASE_PATH}?${params.toString()}`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export function getAdminUnreadNotificationCount(token: string) {
  return apiFetch<{ unreadCount: number }>(`${BASE_PATH}/unread-count`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export function markAllAdminNotificationsAsRead(token: string) {
  return apiFetch<{ unreadCount: number }>(`${BASE_PATH}/read-all`, {
    method: "POST",
    headers: authHeaders(token),
  });
}

export function markAdminNotificationAsRead(id: string, token: string) {
  return apiFetch<{ id: string; unreadCount: number }>(`${BASE_PATH}/${id}/read`, {
    method: "POST",
    headers: authHeaders(token),
  });
}
