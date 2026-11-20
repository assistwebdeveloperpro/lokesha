"use client";

import PagedSection from "@/components/user/dashboard/subscription/PagedSection";
import CreditLedgerList from "@/components/user/dashboard/subscription/CreditLedgerList";
import { CreditLedgerSkeleton } from "@/components/user/dashboard/subscription/PackageUsageSkeletons";
import SubscriptionHistoryList from "@/components/user/dashboard/subscription/SubscriptionHistoryList";
import SubscriptionHistorySkeleton from "@/components/user/dashboard/subscription/SubscriptionHistorySkeleton";
import { fetchUserActions, fetchUserLedger, fetchUserPayments, fetchUserSubscriptionHistory } from "@/services/adminSubscription.service";
import type { PaymentRecord } from "@/services/userSubscription.service";
import AdminActionsList from "./AdminActionsList";
import AdminPaymentsList from "./AdminPaymentsList";
import { ActionsListSkeleton, PaymentsListSkeleton } from "./UserDetailSkeletons";
import { useAdminPagedList } from "./useAdminPagedList";

type TabProps = { userId: string; refreshKey: number };

const PAYMENTS_ERROR = "We could not load the payments. Please try again.";
const SUBSCRIPTIONS_ERROR = "We could not load the subscriptions. Please try again.";
const LEDGER_ERROR = "We could not load the credit activity. Please try again.";
const ACTIONS_ERROR = "We could not load the admin actions. Please try again.";

export function PaymentsTab({ userId, refreshKey, onRefund }: TabProps & { onRefund: (payment: PaymentRecord) => void }) {
  const { page, items, total, isLoading, error, changePage, reload } = useAdminPagedList(fetchUserPayments, userId, PAYMENTS_ERROR, refreshKey);

  return (
    <PagedSection
      isLoading={isLoading}
      error={error}
      total={total}
      page={page}
      skeleton={<PaymentsListSkeleton />}
      emptyTitle="No payments"
      emptyText="This user has not bought a package yet."
      onRetry={reload}
      onPageChange={changePage}
    >
      <AdminPaymentsList payments={items} onRefund={onRefund} />
    </PagedSection>
  );
}

export function SubscriptionsTab({ userId, refreshKey }: TabProps) {
  const { page, items, total, isLoading, error, changePage, reload } = useAdminPagedList(
    fetchUserSubscriptionHistory,
    userId,
    SUBSCRIPTIONS_ERROR,
    refreshKey,
  );

  return (
    <PagedSection
      isLoading={isLoading}
      error={error}
      total={total}
      page={page}
      skeleton={<SubscriptionHistorySkeleton />}
      emptyTitle="No subscriptions"
      emptyText="Every package this user has had will be listed here."
      onRetry={reload}
      onPageChange={changePage}
    >
      <SubscriptionHistoryList subscriptions={items} />
    </PagedSection>
  );
}

export function CreditsTab({ userId, refreshKey }: TabProps) {
  const { page, items, total, isLoading, error, changePage, reload } = useAdminPagedList(fetchUserLedger, userId, LEDGER_ERROR, refreshKey);

  return (
    <PagedSection
      isLoading={isLoading}
      error={error}
      total={total}
      page={page}
      skeleton={<CreditLedgerSkeleton />}
      emptyTitle="No credit activity"
      emptyText="Credits given, used or lost are listed here."
      onRetry={reload}
      onPageChange={changePage}
    >
      <CreditLedgerList entries={items} />
    </PagedSection>
  );
}

export function ActionsTab({ userId, refreshKey }: TabProps) {
  const { page, items, total, isLoading, error, changePage, reload } = useAdminPagedList(fetchUserActions, userId, ACTIONS_ERROR, refreshKey);

  return (
    <PagedSection
      isLoading={isLoading}
      error={error}
      total={total}
      page={page}
      skeleton={<ActionsListSkeleton />}
      emptyTitle="No admin actions"
      emptyText="Gifts, extensions and refunds made for this user are recorded here."
      onRetry={reload}
      onPageChange={changePage}
    >
      <AdminActionsList actions={items} />
    </PagedSection>
  );
}
