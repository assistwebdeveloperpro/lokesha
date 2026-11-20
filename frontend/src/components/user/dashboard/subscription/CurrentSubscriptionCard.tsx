import { CalendarDays, Crown, Gift, Users } from "lucide-react";
import type { ReactNode } from "react";
import type { UserSubscription } from "@/services/userSubscription.service";
import { SOURCE_LABELS, formatDate, formatDaysLeft, plural } from "./subscriptionShared";

const URGENT_DAYS = 7;

type CurrentSubscriptionCardProps = {
  subscription: UserSubscription;
  footer?: ReactNode;
};

export default function CurrentSubscriptionCard({ subscription, footer }: CurrentSubscriptionCardProps) {
  const isFree = subscription.packageCode === "free";
  const Icon = isFree ? Gift : Crown;
  const usedPercent = subscription.totalCredits ? Math.round((subscription.usedCredits / subscription.totalCredits) * 100) : 0;
  const isEndingSoon = subscription.daysLeft !== null && subscription.daysLeft <= URGENT_DAYS;

  return (
    <li className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${isFree ? "bg-emerald-50 text-emerald-600" : "bg-sky-50 text-sky-600"}`}>
            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-slate-800">{subscription.packageName} package</h3>
            <p className="text-xs font-medium text-slate-500">{SOURCE_LABELS[subscription.source]}</p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
            isEndingSoon ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-emerald-50 text-emerald-700 ring-emerald-200"
          }`}
        >
          {subscription.endsAt ? formatDaysLeft(subscription.daysLeft) : "Active"}
        </span>
      </div>

      <div className="mt-5">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-semibold text-slate-700">Listing credits</span>
          <span className="font-bold text-slate-800">
            {subscription.remainingCredits} <span className="font-medium text-slate-400">of {subscription.totalCredits} left</span>
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Credits used"
          aria-valuemin={0}
          aria-valuemax={subscription.totalCredits}
          aria-valuenow={subscription.usedCredits}
          className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100"
        >
          <div className="bg-linear-to-r-navy-blue h-full rounded-full transition-all" style={{ width: `${usedPercent}%` }} />
        </div>
        <p className="mt-1.5 text-xs font-medium text-slate-500">{plural(subscription.usedCredits, "credit")} used</p>
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 px-3.5 py-3">
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" aria-hidden />
          <div>
            <dt className="text-xs font-medium text-slate-500">Valid</dt>
            <dd className="font-semibold text-slate-800">
              {formatDate(subscription.startsAt)} {subscription.endsAt ? `– ${formatDate(subscription.endsAt)}` : "onwards"}
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 px-3.5 py-3">
          <Users className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" aria-hidden />
          <div>
            <dt className="text-xs font-medium text-slate-500">Leads per listing</dt>
            <dd className="font-semibold text-slate-800">{subscription.leadLimit === null ? "Unlimited" : `Up to ${subscription.leadLimit}`}</dd>
          </div>
        </div>
      </dl>

      {footer ? <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">{footer}</div> : null}
    </li>
  );
}
