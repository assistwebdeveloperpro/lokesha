import { CalendarPlus, Gift, Undo2, type LucideIcon } from "lucide-react";
import { formatDateTime } from "@/components/user/dashboard/subscription/subscriptionShared";
import type { AdminAction, AdminActionType } from "@/services/adminSubscription.service";
import { describeAction } from "./usersShared";

const ACTION_STYLES: Record<AdminActionType, { Icon: LucideIcon; className: string }> = {
  gift_credits: { Icon: Gift, className: "bg-emerald-50 text-emerald-600" },
  extend: { Icon: CalendarPlus, className: "bg-sky-50 text-sky-600" },
  refund: { Icon: Undo2, className: "bg-red-50 text-red-600" },
};

function ActionItem({ action }: { action: AdminAction }) {
  const { Icon, className } = ACTION_STYLES[action.type];
  const { title, summary } = describeAction(action);

  return (
    <li className="flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${className}`}>
        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <p className="text-sm font-medium text-slate-600">{summary}</p>
        <p className="mt-1.5 text-sm text-slate-500">&ldquo;{action.reason}&rdquo;</p>
        <p className="mt-1.5 text-xs font-medium text-slate-400">
          {action.admin?.name ?? "Removed admin"} · {formatDateTime(action.createdAt)}
        </p>
      </div>
    </li>
  );
}

export default function AdminActionsList({ actions }: { actions: AdminAction[] }) {
  return (
    <ul className="space-y-3">
      {actions.map((action) => (
        <ActionItem key={action.id} action={action} />
      ))}
    </ul>
  );
}
