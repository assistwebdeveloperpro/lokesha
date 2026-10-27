"use client";

import { Bell } from "lucide-react";
import NotificationSidebar from "./NotificationSidebar";
import { useNotifications, userNotificationSource, type NotificationSource } from "./useNotifications";

const MAX_BADGE_COUNT = 99;

type NotificationBellProps = {
  source?: NotificationSource;
};

export default function NotificationBell({ source = userNotificationSource }: NotificationBellProps) {
  const notifications = useNotifications(source);
  const { unreadCount } = notifications;
  const badge = unreadCount > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : String(unreadCount);

  return (
    <>
      <button
        type="button"
        onClick={notifications.open}
        title="Notifications"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-haspopup="dialog"
        className="relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
      >
        <Bell className="h-5 w-5" aria-hidden />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
            {badge}
          </span>
        ) : null}
      </button>

      <NotificationSidebar notifications={notifications} />
    </>
  );
}
