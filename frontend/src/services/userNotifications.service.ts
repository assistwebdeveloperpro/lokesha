import { apiFetch } from "./apiClient";

export type NotificationStatus = "unread" | "read";

export type UserNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  propertyId: string | null;
  image: string | null;
  isRead: boolean;
  createdAt: string;
};

export type NotificationListResponse = {
  items: UserNotification[];
  page: number;
  limit: number;
  total: number;
  unreadCount: number;
};

export type NotificationListQuery = {
  status: NotificationStatus;
  page?: number;
  limit?: number;
};

const BASE_PATH = "/user/notifications";

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

export function getNotifications(query: NotificationListQuery, token: string) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });

  return apiFetch<NotificationListResponse>(`${BASE_PATH}?${params.toString()}`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export function getUnreadNotificationCount(token: string) {
  return apiFetch<{ unreadCount: number }>(`${BASE_PATH}/unread-count`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export function markAllNotificationsAsRead(token: string) {
  return apiFetch<{ unreadCount: number }>(`${BASE_PATH}/read-all`, {
    method: "POST",
    headers: authHeaders(token),
  });
}

export function markNotificationAsRead(id: string, token: string) {
  return apiFetch<{ id: string; unreadCount: number }>(`${BASE_PATH}/${id}/read`, {
    method: "POST",
    headers: authHeaders(token),
  });
}
