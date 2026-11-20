import { Crown, Gift } from "lucide-react";
import type { UserSubscription } from "@/services/userSubscription.service";
import { SOURCE_LABELS, SUBSCRIPTION_STATUS_TONES, formatDate, plural } from "./subscriptionShared";

function HistoryItem({ subscription }: { subscription: UserSubscription }) {
  const isFree = subscription.packageCode === "free";
  const Icon = isFree ? Gift : Crown;
  const tone = SUBSCRIPTION_STATUS_TONES[subscription.status];

  return (
    <li className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:px-5">
      <div className="flex min-w-[200px] flex-1 items-center gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${isFree ? "bg-emerald-50 text-emerald-600" : "bg-sky-50 text-sky-600"}`}>
          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-800">{subscription.packageName} package</p>
          <p className="text-xs font-medium text-slate-500">{SOURCE_LABELS[subscription.source]}</p>
        </div>
      </div>

      <div className="min-w-[150px]">
        <p className="text-sm font-semibold text-slate-800">
          {subscription.usedCredits} of {plural(subscription.totalCredits, "credit")} used
        </p>
        <p className="text-xs font-medium text-slate-500">{plural(subscription.remainingCredits, "credit")} left</p>
      </div>

      <div className="min-w-[170px]">
        <p className="text-sm font-semibold text-slate-800">{formatDate(subscription.startsAt)}</p>
        <p className="text-xs font-medium text-slate-500">{subscription.endsAt ? `Ends ${formatDate(subscription.endsAt)}` : "No end date"}</p>
      </div>

      <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tone.className}`}>{tone.label}</span>
    </li>
  );
}

export default function SubscriptionHistoryList({ subscriptions }: { subscriptions: UserSubscription[] }) {
  return (
    <ul className="space-y-3">
      {subscriptions.map((subscription) => (
        <HistoryItem key={subscription.id} subscription={subscription} />
      ))}
    </ul>
  );
}
