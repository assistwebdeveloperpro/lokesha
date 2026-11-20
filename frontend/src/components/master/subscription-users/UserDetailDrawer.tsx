"use client";

import { CalendarPlus, Gift, X } from "lucide-react";
import { useEffect, useState } from "react";
import ExtendSubscriptionModal from "@/components/master/subscription-actions/ExtendSubscriptionModal";
import GiftCreditsModal from "@/components/master/subscription-actions/GiftCreditsModal";
import RefundOrderModal from "@/components/master/subscription-actions/RefundOrderModal";
import { useToast } from "@/components/shared/ui/ToastProvider";
import CreditSummaryTiles from "@/components/user/dashboard/subscription/CreditSummaryTiles";
import CurrentSubscriptionCard from "@/components/user/dashboard/subscription/CurrentSubscriptionCard";
import { formatDate } from "@/components/user/dashboard/subscription/subscriptionShared";
import { cn } from "@/lib/utils";
import type { PaymentRecord, UserSubscription } from "@/services/userSubscription.service";
import { ActionsTab, CreditsTab, PaymentsTab, SubscriptionsTab } from "./UserDetailTabs";
import { UserDetailSkeleton } from "./UserDetailSkeletons";
import { useUserDetail } from "./useUserDetail";

type DetailTab = "payments" | "subscriptions" | "credits" | "actions";

const TABS: { id: DetailTab; label: string }[] = [
  { id: "payments", label: "Payments" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "credits", label: "Credit activity" },
  { id: "actions", label: "Admin actions" },
];

type UserDetailDrawerProps = {
  user: { id: string; name: string };
  onClose: () => void;
  // Lets the users table refresh its totals after an admin action
  onChanged: () => void;
};

export default function UserDetailDrawer({ user, onClose, onChanged }: UserDetailDrawerProps) {
  const { showToast } = useToast();
  const { detail, isLoading, error, version, refresh, reload } = useUserDetail(user.id);
  const [activeTab, setActiveTab] = useState<DetailTab>("payments");
  const [isGifting, setIsGifting] = useState(false);
  const [extending, setExtending] = useState<UserSubscription | null>(null);
  const [refunding, setRefunding] = useState<PaymentRecord | null>(null);
  const hasOpenDialog = isGifting || extending !== null || refunding !== null;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Escape belongs to an open dialog first
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !hasOpenDialog) onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasOpenDialog, onClose]);

  const handleDone = (message: string) => {
    showToast(message, "success");
    setIsGifting(false);
    setExtending(null);
    setRefunding(null);
    refresh();
    onChanged();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" aria-label="Close user details" onClick={onClose} className="absolute inset-0 cursor-pointer bg-slate-900/40" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-detail-heading"
        className="relative flex h-full w-full max-w-3xl flex-col bg-slate-50 shadow-2xl"
      >
        <header className="bg-linear-to-r-navy-blue flex items-start justify-between gap-4 px-5 py-4 text-white sm:px-6">
          <div className="min-w-0">
            <h2 id="user-detail-heading" className="font-display truncate text-lg font-bold">
              {detail?.user.name ?? user.name}
            </h2>
            <p className="truncate text-xs font-medium text-slate-300">
              {detail ? `${detail.user.mobile}${detail.user.email ? ` · ${detail.user.email}` : ""} · Joined ${formatDate(detail.user.joinedAt)}` : "Loading details"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={!detail}
              onClick={() => setIsGifting(true)}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Gift className="h-4 w-4" aria-hidden />
              Gift credits
            </button>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6" aria-live="polite">
          {isLoading ? (
            <UserDetailSkeleton />
          ) : error || !detail ? (
            <div className="flex flex-col items-center rounded-2xl border border-slate-200/90 bg-white px-6 py-14 text-center shadow-sm">
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
              <button
                type="button"
                onClick={reload}
                className="bg-linear-to-r-navy-blue mt-5 min-h-10 cursor-pointer rounded-xl px-6 text-sm font-semibold text-white shadow-md"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <CreditSummaryTiles summary={detail.summary} />

              {detail.subscriptions.length ? (
                <ul className="grid gap-4 lg:grid-cols-2">
                  {detail.subscriptions.map((subscription) => (
                    <CurrentSubscriptionCard
                      key={subscription.id}
                      subscription={subscription}
                      footer={
                        subscription.endsAt ? (
                          <button
                            type="button"
                            onClick={() => setExtending(subscription)}
                            className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                          >
                            <CalendarPlus className="h-3.5 w-3.5" aria-hidden />
                            Extend
                          </button>
                        ) : undefined
                      }
                    />
                  ))}
                </ul>
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center text-sm font-medium text-slate-500">
                  This user has no running subscription.
                </p>
              )}

              <div>
                <div role="tablist" aria-label="User subscription details" className="flex gap-1 overflow-x-auto rounded-xl bg-slate-200/70 p-1">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      id={`user-tab-${tab.id}`}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      aria-controls="user-tab-panel"
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "min-h-10 shrink-0 cursor-pointer rounded-lg px-4 text-sm font-semibold transition",
                        activeTab === tab.id ? "bg-white text-navy-blue shadow-sm" : "text-slate-500 hover:text-slate-700",
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div id="user-tab-panel" role="tabpanel" aria-labelledby={`user-tab-${activeTab}`} className="mt-4">
                  {activeTab === "payments" ? <PaymentsTab userId={user.id} refreshKey={version} onRefund={setRefunding} /> : null}
                  {activeTab === "subscriptions" ? <SubscriptionsTab userId={user.id} refreshKey={version} /> : null}
                  {activeTab === "credits" ? <CreditsTab userId={user.id} refreshKey={version} /> : null}
                  {activeTab === "actions" ? <ActionsTab userId={user.id} refreshKey={version} /> : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {isGifting ? <GiftCreditsModal user={user} onClose={() => setIsGifting(false)} onDone={handleDone} /> : null}
      {extending && extending.endsAt ? (
        <ExtendSubscriptionModal
          subscription={{ id: extending.id, packageName: extending.packageName, endsAt: extending.endsAt }}
          onClose={() => setExtending(null)}
          onDone={handleDone}
        />
      ) : null}
      {refunding ? <RefundOrderModal order={refunding} onClose={() => setRefunding(null)} onDone={handleDone} /> : null}
    </div>
  );
}
