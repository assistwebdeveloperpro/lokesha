"use client";

import { Building2, Check, XCircle } from "lucide-react";
import { useState } from "react";
import { getAssetUrl } from "@/services/apiClient";
import type { UserNotification } from "@/services/userNotifications.service";
import { formatTimeAgo } from "./formatTimeAgo";

type NotificationItemProps = {
  notification: UserNotification;
  isBusy: boolean;
  onMarkAsRead: (id: string) => void;
};

const REJECTED_TYPE = "property_rejected";
const REJECTION_PREFIX = /^Your property was (?:rejected:|not approved\. Reason:)\s*/i;

export default function NotificationItem({ notification, isBusy, onMarkAsRead }: NotificationItemProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const showImage = notification.image && !hasImageError;
  const isRejected = notification.type === REJECTED_TYPE;
  const rejectionReason = notification.message.replace(REJECTION_PREFIX, "");

  return (
    <li className={`flex gap-3 border-b border-slate-100 px-4 py-4 ${isBusy ? "opacity-60" : ""}`}>
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getAssetUrl(notification.image as string)}
            alt={notification.title}
            loading="lazy"
            onError={() => setHasImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-slate-400">
            <Building2 className="h-6 w-6" aria-hidden />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-900" title={notification.title}>
          {notification.title}
        </p>
        {isRejected ? (
          <>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
              <XCircle className="h-3.5 w-3.5" aria-hidden />
              Rejected
            </span>
            <div className="mt-2 rounded-lg border-l-4 border-red-400 bg-red-50/60 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Reason</p>
              <p className="mt-0.5 wrap-break-word text-sm text-slate-700">{rejectionReason}</p>
            </div>
          </>
        ) : (
          <p className="mt-0.5 wrap-break-word text-sm text-slate-600">{notification.message}</p>
        )}

        <div className="mt-2 flex items-center justify-between gap-3">
          {notification.isRead ? (
            <span className="text-xs font-medium text-slate-400">Read</span>
          ) : (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onMarkAsRead(notification.id)}
              className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-sky-700 transition hover:text-sky-900 disabled:cursor-not-allowed"
            >
              <Check className="h-3.5 w-3.5" aria-hidden />
              Mark as read
            </button>
          )}
          <span className="shrink-0 text-xs text-slate-400">{formatTimeAgo(notification.createdAt)}</span>
        </div>
      </div>
    </li>
  );
}
