import { Eye } from "lucide-react";
import { formatRupees } from "@/lib/currency";
import { ORDER_STATUS_TONES, formatDate } from "@/components/user/dashboard/subscription/subscriptionShared";
import type { AdminUserRow } from "@/services/adminSubscription.service";
import {
  PACKAGE_LABELS,
  USER_GRID_CLASS,
  USER_TABLE_COLUMNS,
  USER_TABLE_MIN_WIDTH_CLASS,
  getCreditsLeft,
  getCreditsUsedPercent,
  getInitials,
  getUserStatus,
} from "./usersShared";

type UsersTableProps = {
  users: AdminUserRow[];
  onView: (user: AdminUserRow) => void;
};

function UserRow({ user, onView }: { user: AdminUserRow; onView: UsersTableProps["onView"] }) {
  const status = getUserStatus(user);
  const payment = user.paymentStatus ? ORDER_STATUS_TONES[user.paymentStatus] : null;

  return (
    <li className={`border-b border-slate-100 px-4 py-4 transition-colors last:border-b-0 even:bg-slate-50/40 hover:bg-sky-50/50 sm:px-5 ${USER_GRID_CLASS}`}>
      <div className="flex min-w-0 items-center gap-3">
        <span className="bg-linear-to-r-navy-blue flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm">
          {getInitials(user.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-800">{user.name}</p>
          <p className="text-xs font-medium text-slate-500">{user.mobile}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {user.packages.map((code) => (
          <span
            key={code}
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${
              code === "standard" ? "bg-sky-50 text-sky-700 ring-sky-200" : "bg-emerald-50 text-emerald-700 ring-emerald-200"
            }`}
          >
            {PACKAGE_LABELS[code]}
          </span>
        ))}
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-800">
          {user.creditsUsed} / {user.creditsBought} used
        </p>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-sky-500" style={{ width: `${getCreditsUsedPercent(user)}%` }} />
        </div>
        <p className="mt-1 text-xs font-medium text-slate-500">{getCreditsLeft(user)} left</p>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-800">{formatDate(user.startsAt)}</p>
        <p className="text-xs font-medium text-slate-500">{user.endsAt ? `Until ${formatDate(user.endsAt)}` : "No end date"}</p>
      </div>

      <p className="text-sm font-bold text-slate-800">{user.amountPaid ? formatRupees(user.amountPaid) : "—"}</p>

      <div>
        {payment ? (
          <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${payment.className}`}>{payment.label}</span>
        ) : (
          <span className="text-xs font-medium text-slate-400">No payments</span>
        )}
      </div>

      <span className={`inline-flex w-fit whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${status.className}`}>{status.label}</span>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onView(user)}
          aria-label={`View ${user.name}`}
          className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
        >
          <Eye className="h-3.5 w-3.5" aria-hidden />
          View
        </button>
      </div>
    </li>
  );
}

export default function UsersTable({ users, onView }: UsersTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-md scrollbar-hidden">
      <div className={USER_TABLE_MIN_WIDTH_CLASS}>
        <div
          className={`border-b border-slate-200 bg-linear-to-b from-slate-50 to-slate-100/70 px-5 py-4 text-[12px] font-bold uppercase tracking-wider text-slate-600 ${USER_GRID_CLASS}`}
        >
          {USER_TABLE_COLUMNS.map((column, index) => (
            <span key={index}>{column}</span>
          ))}
        </div>
        <ul>
          {users.map((user) => (
            <UserRow key={user.id} user={user} onView={onView} />
          ))}
        </ul>
      </div>
    </div>
  );
}
