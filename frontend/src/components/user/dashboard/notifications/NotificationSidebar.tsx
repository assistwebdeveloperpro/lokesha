"use client";

import { BellOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { NotificationStatus, UserNotification } from "@/services/userNotifications.service";
import NotificationItem from "./NotificationItem";
import type { useNotifications } from "./useNotifications";

type NotificationSidebarProps = {
  notifications: ReturnType<typeof useNotifications>;
  getNotificationHref?: (notification: UserNotification) => string | null;
  onActivate?: (notification: UserNotification) => void;
};

const TABS: { status: NotificationStatus; label: string }[] = [
  { status: "unread", label: "Unread" },
  { status: "read", label: "Read" },
];

const EMPTY_MESSAGES: Record<NotificationStatus, string> = {
  unread: "You're all caught up. No unread notifications.",
  read: "No read notifications yet.",
};

export default function NotificationSidebar({
  notifications,
  getNotificationHref,
  onActivate,
}: NotificationSidebarProps) {
  const { isOpen, tab, items, unreadCount, isMarkingAll, isLoading, isLoadingMore, error, busyId, hasMore, close } = notifications;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousBackground = document.body.style.backgroundColor;
    document.body.style.overflow = "hidden";
    document.body.style.backgroundColor = "#ffffff";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.backgroundColor = previousBackground;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, close]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-80">
      <button
        type="button"
        aria-label="Close notifications"
        className="absolute inset-0 cursor-pointer bg-slate-900/40"
        onClick={close}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-heading"
        className="absolute inset-y-0 right-0 flex h-dvh max-h-dvh w-full max-w-md flex-col bg-white shadow-2xl"
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-4">
          <button
            type="button"
            aria-label="Close notifications"
            onClick={close}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
          <h2 id="notifications-heading" className="text-lg font-bold text-slate-900">
            Unread({unreadCount})
          </h2>
        </header>

        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 bg-white px-4 py-3">
          <div className="flex gap-2" role="tablist" aria-label="Notification filter">
            {TABS.map(({ status, label }) => (
              <button
                key={status}
                type="button"
                role="tab"
                aria-selected={tab === status}
                onClick={() => notifications.changeTab(status)}
                className={`min-h-9 cursor-pointer rounded-full border px-5 text-sm font-semibold transition ${
                  tab === status
                    ? "border-navy-blue bg-navy-blue text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {unreadCount > 0 ? (
            <button
              type="button"
              disabled={isMarkingAll}
              onClick={notifications.markAllAsRead}
              className="cursor-pointer text-sm font-semibold text-navy-blue underline underline-offset-4 transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Mark all read
            </button>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-white" aria-live="polite">
          {isLoading ? (
            <ul aria-busy="true" className="animate-pulse">
              {Array.from({ length: 4 }, (_, index) => (
                <li key={index} className="flex gap-3 border-b border-slate-100 px-4 py-4">
                  <div className="h-16 w-16 shrink-0 rounded-lg bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 rounded bg-slate-200" />
                    <div className="h-3 w-full rounded bg-slate-100" />
                    <div className="h-3 w-2/3 rounded bg-slate-100" />
                  </div>
                </li>
              ))}
            </ul>
          ) : error ? (
            <div className="px-6 py-14 text-center">
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
              <button
                type="button"
                onClick={notifications.reload}
                className="bg-linear-to-r-navy-blue mt-4 min-h-10 cursor-pointer rounded-xl px-6 text-sm font-semibold text-white shadow-md"
              >
                Try again
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center text-slate-500">
              <BellOff className="h-10 w-10 text-slate-300" aria-hidden />
              <p className="mt-3 text-sm">{EMPTY_MESSAGES[tab]}</p>
            </div>
          ) : (
            <>
              <ul>
                {items.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    isBusy={busyId === notification.id}
                    onMarkAsRead={notifications.markAsRead}
                    href={getNotificationHref?.(notification) ?? null}
                    onActivate={onActivate}
                  />
                ))}
              </ul>
              {hasMore ? (
                <div className="flex justify-center px-4 py-4">
                  <button
                    type="button"
                    disabled={isLoadingMore}
                    onClick={notifications.loadMore}
                    className="min-h-10 cursor-pointer rounded-xl border border-navy-blue px-6 text-sm font-semibold text-navy-blue transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoadingMore ? "Loading..." : "Load more"}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </aside>
    </div>,
    document.body,
  );
}
