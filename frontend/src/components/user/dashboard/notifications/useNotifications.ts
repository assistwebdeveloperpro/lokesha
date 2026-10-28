"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/shared/ui/ToastProvider";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationListQuery,
  type NotificationListResponse,
  type NotificationStatus,
  type UserNotification,
} from "@/services/userNotifications.service";
import { getToken } from "@/services/session";

export type NotificationSource = {
  getToken: () => string | null;
  getNotifications: (query: NotificationListQuery, token: string) => Promise<NotificationListResponse>;
  getUnreadCount: (token: string) => Promise<{ unreadCount: number }>;
  markAsRead: (id: string, token: string) => Promise<{ id: string; unreadCount: number }>;
  markAllAsRead: (token: string) => Promise<{ unreadCount: number }>;
  getNotificationHref?: (notification: UserNotification) => string | null;
};

export const userNotificationSource: NotificationSource = {
  getToken,
  getNotifications,
  getUnreadCount: getUnreadNotificationCount,
  markAsRead: markNotificationAsRead,
  markAllAsRead: markAllNotificationsAsRead,
};

const PAGE_SIZE = 20;
const COUNT_REFRESH_MS = 60_000;
const LOAD_ERROR = "We could not load your notifications. Please try again.";
const MARK_READ_ERROR = "We could not mark the notification as read. Please try again.";
const MARK_ALL_READ_ERROR = "We could not mark all notifications as read. Please try again.";

export function useNotifications(source: NotificationSource = userNotificationSource) {
  const { showToast } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<NotificationStatus>("unread");
  const [reloadToken, setReloadToken] = useState(0);
  const [items, setItems] = useState<UserNotification[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const nextPage = useRef(2);

  // The bell shows the count without opening the panel, so it is refreshed in the background
  useEffect(() => {
    let cancelled = false;

    const refreshCount = () => {
      const token = source.getToken();
      if (!token) return;

      source
        .getUnreadCount(token)
        .then((response) => !cancelled && setUnreadCount(response.unreadCount))
        .catch(() => undefined);
    };

    refreshCount();
    const timer = setInterval(refreshCount, COUNT_REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [source]);

  useEffect(() => {
    const token = source.getToken();
    if (!isOpen || !token) return;

    let cancelled = false;
    source
      .getNotifications({ status: tab, page: 1, limit: PAGE_SIZE }, token)
      .then((response) => {
        if (cancelled) return;
        setItems(response.items);
        setTotal(response.total);
        setUnreadCount(response.unreadCount);
        setError("");
        nextPage.current = 2;
      })
      .catch(() => !cancelled && setError(LOAD_ERROR))
      .finally(() => !cancelled && setIsLoading(false));

    return () => {
      cancelled = true;
    };
  }, [source, isOpen, tab, reloadToken]);

  const open = () => {
    setIsLoading(true);
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const changeTab = (next: NotificationStatus) => {
    if (next === tab) return;
    setItems([]);
    setIsLoading(true);
    setTab(next);
  };

  const reload = () => {
    setIsLoading(true);
    setReloadToken((current) => current + 1);
  };

  const loadMore = async () => {
    const token = source.getToken();
    if (!token || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const response = await source.getNotifications({ status: tab, page: nextPage.current, limit: PAGE_SIZE }, token);
      // Reading one meanwhile shifts the pages, so duplicates are dropped
      setItems((current) => {
        const known = new Set(current.map((item) => item.id));
        return [...current, ...response.items.filter((item) => !known.has(item.id))];
      });
      setTotal(response.total);
      nextPage.current += 1;
    } catch {
      showToast(LOAD_ERROR, "error");
    } finally {
      setIsLoadingMore(false);
    }
  };

  // The notification leaves the Unread list and the count goes down by one
  const markAsRead = async (id: string) => {
    const token = source.getToken();
    if (!token || busyId) return;

    setBusyId(id);
    try {
      const response = await source.markAsRead(id, token);
      setUnreadCount(response.unreadCount);
      setItems((current) => current.filter((item) => item.id !== id));
      setTotal((current) => Math.max(0, current - 1));
    } catch {
      showToast(MARK_READ_ERROR, "error");
    } finally {
      setBusyId(null);
    }
  };

  // Every unread notification moves to Read, so the Unread list becomes empty
  const markAllAsRead = async () => {
    const token = source.getToken();
    if (!token || isMarkingAll) return;

    setIsMarkingAll(true);
    try {
      const response = await source.markAllAsRead(token);
      setUnreadCount(response.unreadCount);
      if (tab === "unread") {
        setItems([]);
        setTotal(0);
      } else {
        reload();
      }
    } catch {
      showToast(MARK_ALL_READ_ERROR, "error");
    } finally {
      setIsMarkingAll(false);
    }
  };

  return {
    unreadCount,
    isMarkingAll,
    isOpen,
    tab,
    items,
    isLoading,
    isLoadingMore,
    error,
    busyId,
    hasMore: items.length < total,
    open,
    close,
    changeTab,
    reload,
    loadMore,
    markAsRead,
    markAllAsRead,
  };
}
