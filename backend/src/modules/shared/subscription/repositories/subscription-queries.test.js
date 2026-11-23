// Every repository below runs for real against a connection that only records SQL, so a query that
// cannot be built fails here and the delicate ones are checked clause by clause
jest.mock("../../../../config/db", () => {
  const { createSqlCaptureDb } = require("../test-utils/sql-capture-db");
  const capture = createSqlCaptureDb();
  return { db: capture.db, capture };
});

const { db, capture } = require("../../../../config/db");
const subscriptionRepository = require("./subscription.repository");
const ledgerRepository = require("./subscription-ledger.repository");
const orderRepository = require("./subscription-order.repository");
const invoiceRepository = require("./subscription-invoice.repository");
const expiryRepository = require("./subscription-expiry.repository");
const recoveryRepository = require("./subscription-recovery.repository");
const backfillRepository = require("./subscription-backfill.repository");
const overviewRepository = require("../../../user/dashboard/user-subscription/user-subscription-overview.repository");
const userSubscriptionRepository = require("../../../user/dashboard/user-subscription/user-subscription.repository");
const packagesRepository = require("../../../master/dashboard/subscription-packages/subscription-packages.repository");
const settingsRepository = require("../../../master/dashboard/subscription-settings/subscription-settings.repository");
const actionsRepository = require("../../../master/dashboard/subscription-actions/subscription-actions.repository");
const webhookRepository = require("../../../landing/razorpay-webhook/razorpay-webhook.repository");
const usersRepository = require("../../../master/dashboard/subscription-users/subscription-users.repository");
const transactionsRepository = require("../../../master/dashboard/subscription-transactions/subscription-transactions.repository");
const reportsRepository = require("../../../master/dashboard/subscription-reports/subscription-reports.repository");
const leadsRepository = require("../../../master/dashboard/leads/leads.repository");

const NOW = new Date("2026-11-20T10:00:00.000Z");
const PAGING = { page: 2, limit: 10 };

// Runs the call and returns the SQL of the statement it sent last
async function sqlOf(call) {
  capture.reset();
  await call();
  return capture.last().sql;
}

describe("every repository query can be built", () => {
  const calls = {
    "subscription.findActivePackageByCode": () => subscriptionRepository.findActivePackageByCode(db, "free"),
    "subscription.findPackageByCode": () => subscriptionRepository.findPackageByCode(db, "standard"),
    "subscription.insertSubscriptionIfAbsent": () => subscriptionRepository.insertSubscriptionIfAbsent(db, { user_id: "u" }),
    "subscription.insertSubscription": () => subscriptionRepository.insertSubscription(db, { user_id: "u" }),
    "subscription.findUsableSubscriptionsForUpdate": () => subscriptionRepository.findUsableSubscriptionsForUpdate(db, "u", NOW),
    "subscription.incrementUsedCredits": () => subscriptionRepository.incrementUsedCredits(db, "s"),
    "subscription.findPropertyBillingState": () => subscriptionRepository.findPropertyBillingState(db, "p"),
    "subscription.markPropertyBilled": () =>
      subscriptionRepository.markPropertyBilled(db, "p", { subscriptionId: "s", expiresAt: NOW, leadLimit: 2 }),
    "subscription.countReservedProperties": () => subscriptionRepository.countReservedProperties(db, "u", NOW),
    "subscription.findLeadLimitForUpdate": () => subscriptionRepository.findLeadLimitForUpdate(db, "p"),
    "subscription.findHighestSentLeadPosition": () => subscriptionRepository.findHighestSentLeadPosition(db, "p"),
    "subscription.adjustExtraLeads": () => subscriptionRepository.adjustExtraLeads(db, "p", 10),
    "subscription.findPropertyLeadPosition": () => subscriptionRepository.findPropertyLeadPosition(db, "p", "l"),
    "ledger.insertEntry": () => ledgerRepository.insertEntry(db, { subscriptionId: "s", userId: "u", type: "used", credits: -1 }),
    "order.insertOrder": () => orderRepository.insertOrder(db, { order_number: "O" }),
    "order.updateOrder": () => orderRepository.updateOrder(db, "o", { status: "paid" }),
    "order.findOrderByIdForUpdate": () => orderRepository.findOrderByIdForUpdate(db, "o"),
    "order.findOrderByRazorpayOrderIdForUpdate": () => orderRepository.findOrderByRazorpayOrderIdForUpdate(db, "r"),
    "order.findOrderByRazorpayOrderId": () => orderRepository.findOrderByRazorpayOrderId("r"),
    "order.findOrderForUser": () => orderRepository.findOrderForUser("u", "o"),
    "invoice.takeNextSequence": () => invoiceRepository.takeNextSequence(db, "2026-27", "invoice"),
    "invoice.insertInvoice": () => invoiceRepository.insertInvoice(db, { invoice_number: "I" }),
    "invoice.findInvoiceByOrder": () => invoiceRepository.findInvoiceByOrder(db, "o", "invoice"),
    "invoice.findInvoiceById": () => invoiceRepository.findInvoiceById("i"),
    "invoice.findInvoiceForUser": () => invoiceRepository.findInvoiceForUser("u", "i"),
    "invoice.findSettings": () => invoiceRepository.findSettings(db),
    "invoice.findBuyer": () => invoiceRepository.findBuyer(db, "u"),
    "expiry.findExpiredSubscriptionIds": () => expiryRepository.findExpiredSubscriptionIds(NOW, 100),
    "expiry.lockExpiredSubscription": () => expiryRepository.lockExpiredSubscription(db, "s", NOW),
    "expiry.markSubscriptionExpired": () => expiryRepository.markSubscriptionExpired(db, "s"),
    "expiry.findLivePropertiesOfSubscription": () => expiryRepository.findLivePropertiesOfSubscription(db, "s"),
    "expiry.findExpiredPropertyIds": () => expiryRepository.findExpiredPropertyIds(NOW, 100),
    "expiry.lockExpiredProperty": () => expiryRepository.lockExpiredProperty(db, "p", NOW),
    "expiry.findDueReminderIds": () => expiryRepository.findDueReminderIds(NOW, NOW, 100),
    "expiry.lockSubscriptionForReminder": () => expiryRepository.lockSubscriptionForReminder(db, "s"),
    "expiry.markRemindersSent": () => expiryRepository.markRemindersSent(db, "s", { sevenDay: true, oneDay: true }),
    "recovery.findRecoveryMinutes": () => recoveryRepository.findRecoveryMinutes(),
    "recovery.findRecoverableOrders": () => recoveryRepository.findRecoverableOrders({ olderThan: NOW, newerThan: NOW, limit: 50 }),
    "recovery.findAbandonedOrders": () => recoveryRepository.findAbandonedOrders(NOW, 50),
    "recovery.cancelOrderIfOpen": () => recoveryRepository.cancelOrderIfOpen("o", "reason"),
    "backfill.findActiveFreePackage": () => backfillRepository.findActiveFreePackage(),
    "backfill.countUsersWithoutFreePackage": () => backfillRepository.countUsersWithoutFreePackage(),
    "backfill.findUsersWithoutFreePackage": () => backfillRepository.findUsersWithoutFreePackage({ after: "u", limit: 200 }),
    "overview.findCurrentSubscriptions": () => overviewRepository.findCurrentSubscriptions("u", NOW),
    "overview.countReservedProperties": () => overviewRepository.countReservedProperties("u", NOW),
    "overview.hasAnySubscription": () => overviewRepository.hasAnySubscription("u"),
    "overview.findLatestOrder": () => overviewRepository.findLatestOrder("u"),
    "overview.findSubscriptionHistory": () => overviewRepository.findSubscriptionHistory("u", PAGING),
    "overview.countSubscriptionHistory": () => overviewRepository.countSubscriptionHistory("u"),
    "overview.findOrders": () => overviewRepository.findOrders("u", PAGING),
    "overview.countOrders": () => overviewRepository.countOrders("u"),
    "overview.findLedger": () => overviewRepository.findLedger("u", PAGING),
    "overview.countLedger": () => overviewRepository.countLedger("u"),
    "overview.findPropertyLeadUsage": () => overviewRepository.findPropertyLeadUsage("u", PAGING),
    "overview.countPropertyLeadUsage": () => overviewRepository.countPropertyLeadUsage("u"),
    "userSubscription.findActivePackages": () => userSubscriptionRepository.findActivePackages(),
    "userSubscription.findPurchasablePackage": () => userSubscriptionRepository.findPurchasablePackage(),
    "userSubscription.findLeadPackPackage": () => userSubscriptionRepository.findLeadPackPackage(),
    "userSubscription.findEligibleProperty": () => userSubscriptionRepository.findEligibleProperty("u", "p", NOW),
    "userSubscription.findCheckoutUser": () => userSubscriptionRepository.findCheckoutUser("u"),
    "userSubscription.insertOrder": () => userSubscriptionRepository.insertOrder({ order_number: "O" }),
    "userSubscription.updateOrder": () => userSubscriptionRepository.updateOrder("o", { status: "pending" }),
    "packages.findAll": () => packagesRepository.findAll(),
    "packages.findById": () => packagesRepository.findById("p"),
    "packages.findByIdForUpdate": () => packagesRepository.findByIdForUpdate(db, "p"),
    "packages.updateById": () => packagesRepository.updateById(db, "p", { name: "N" }),
    "packages.insertAuditLog": () => packagesRepository.insertAuditLog(db, { packageId: "p", adminId: "a", changes: {} }),
    "packages.findAuditLogs": () => packagesRepository.findAuditLogs("p", PAGING),
    "packages.countAuditLogs": () => packagesRepository.countAuditLogs("p"),
    "settings.findSettings": () => settingsRepository.findSettings(),
    "settings.saveSettings": () => settingsRepository.saveSettings({ gstin: "G" }),
    "actions.insertAction": () => actionsRepository.insertAction(db, { adminId: "a", userId: "u", type: "refund", reason: "r" }),
    "actions.findActions": () => actionsRepository.findActions("u", PAGING),
    "actions.countActions": () => actionsRepository.countActions("u"),
    "actions.findUser": () => actionsRepository.findUser(db, "u"),
    "actions.findOrder": () => actionsRepository.findOrder("o"),
    "actions.lockSubscriptionProperties": () => actionsRepository.lockSubscriptionProperties(db, "s"),
    "actions.findSubscriptionForUpdate":() => actionsRepository.findSubscriptionForUpdate(db, "s"),
    "actions.findSubscriptionByOrderForUpdate": () => actionsRepository.findSubscriptionByOrderForUpdate(db, "o"),
    "actions.updateSubscriptionEnd": () => actionsRepository.updateSubscriptionEnd(db, "s", NOW),
    "actions.extendPropertyExpiry": () => actionsRepository.extendPropertyExpiry(db, "s", NOW),
    "actions.markSubscriptionRefunded": () => actionsRepository.markSubscriptionRefunded(db, "s"),
    "webhook.insertEventIfAbsent": () => webhookRepository.insertEventIfAbsent({ eventId: "e", type: "t", payload: {} }),
    "webhook.findEvent": () => webhookRepository.findEvent("e"),
    "webhook.markProcessed": () => webhookRepository.markProcessed("e"),
    "users.findUsers": () => usersRepository.findUsers({ ...PAGING, search: "a", package: "free", status: "active" }),
    "users.countUsers": () => usersRepository.countUsers({ ...PAGING }),
    "users.findUser": () => usersRepository.findUser("u"),
    "transactions.findTransactions": () => transactionsRepository.findTransactions({ ...PAGING, search: "a", status: "paid" }),
    "transactions.countTransactions": () => transactionsRepository.countTransactions({ status: "paid" }),
    "transactions.findTransactionsForExport": () => transactionsRepository.findTransactionsForExport({ from: NOW, to: NOW }, 10000),
    "reports.findPaidTotals": () => reportsRepository.findPaidTotals({ from: NOW, to: NOW }),
    "reports.findRefundedTotals": () => reportsRepository.findRefundedTotals({}),
    "reports.countOrdersByStatus": () => reportsRepository.countOrdersByStatus("failed", {}),
    "reports.countActiveStandardUsers": () => reportsRepository.countActiveStandardUsers(NOW),
    "reports.countExhaustedFreeUsers": () => reportsRepository.countExhaustedFreeUsers(),
  };

  it.each(Object.entries(calls))("%s", async (_name, call) => {
    capture.reset();

    await expect(call()).resolves.not.toThrow();
    expect(capture.queries.length).toBeGreaterThan(0);
  });
});

describe("the delicate queries", () => {
  it("takes the next invoice number with one upsert that keeps the row locked for the transaction", async () => {
    const sql = await sqlOf(() => invoiceRepository.takeNextSequence(db, "2026-27", "invoice"));

    expect(sql).toContain('insert into "invoice_sequences" ("financial_year", "last_value", "type")');
    expect(sql).toContain('on conflict ("financial_year", "type") do update set "last_value" = invoice_sequences.last_value + 1');
    expect(sql).toContain('returning "last_value"');
  });

  it("ignores a Free package that already exists instead of failing the registration", async () => {
    const sql = await sqlOf(() => subscriptionRepository.insertSubscriptionIfAbsent(db, { user_id: "u" }));

    expect(sql).toContain("on conflict do nothing");
    expect(sql).toContain("returning *");
  });

  it("picks Free first and then the earliest end, locking only usable subscriptions", async () => {
    const sql = await sqlOf(() => subscriptionRepository.findUsableSubscriptionsForUpdate(db, "u", NOW));

    expect(sql).toContain("used_credits < total_credits");
    expect(sql).toContain("order by ends_at asc nulls first");
    expect(sql).toContain("for update");
  });

  it("counts a credit and flips the subscription to exhausted in the same statement", async () => {
    const sql = await sqlOf(() => subscriptionRepository.incrementUsedCredits(db, "s"));

    expect(sql).toContain("used_credits + 1");
    expect(sql).toContain("CASE WHEN used_credits + 1 >= total_credits THEN 'exhausted' ELSE status END");
  });

  it("locks only the property row of a joined lookup and skips rows another run holds", async () => {
    const sql = await sqlOf(() => expiryRepository.lockExpiredProperty(db, "p", NOW));

    expect(sql).toContain('left join "user_subscriptions" as "s"');
    expect(sql).toContain('for update of "p" skip locked');
  });

  it("skips subscriptions another run is already expiring", async () => {
    expect(await sqlOf(() => expiryRepository.lockExpiredSubscription(db, "s", NOW))).toContain("for update skip locked");
    expect(await sqlOf(() => expiryRepository.lockSubscriptionForReminder(db, "s"))).toContain("for update skip locked");
  });

  it("locks the property row without blocking the lead rows that reference it", async () => {
    const sql = await sqlOf(() => subscriptionRepository.findLeadLimitForUpdate(db, "p"));

    expect(sql).toContain("for no key update");
  });

  it("reads the base limit with the bought leads and keeps unlimited properties unlimited", async () => {
    const sql = await sqlOf(() => subscriptionRepository.findLeadLimitForUpdate(db, "p"));

    expect(sql).toContain('"lead_limit", "extra_leads"');

    const trxReturning = (row) => () => ({ where: () => ({ forNoKeyUpdate: () => ({ first: async () => row }) }) });

    expect(await subscriptionRepository.findLeadLimitForUpdate(trxReturning({ lead_limit: 2, extra_leads: 10 }), "p")).toBe(12);
    expect(await subscriptionRepository.findLeadLimitForUpdate(trxReturning({ lead_limit: null, extra_leads: 10 }), "p")).toBeNull();
    expect(await subscriptionRepository.findLeadLimitForUpdate(trxReturning(undefined), "p")).toBeNull();
  });

  it("flags a held lead against the base limit plus bought leads", async () => {
    const sql = await sqlOf(() => leadsRepository.findLeads({ page: 1, limit: 10 }));

    expect(sql).toContain("p.lead_limit is not null");
    expect(sql).toContain("> p.lead_limit + p.extra_leads");
  });

  it("ranks every lead of the property before picking the highest sent one", async () => {
    const sql = await sqlOf(() => subscriptionRepository.findHighestSentLeadPosition(db, "p"));

    expect(sql).toContain("row_number() over (order by created_at asc, id asc)");
    expect(sql).toContain('"distribution_status" = $');
    expect(sql).toContain("max(");
    expect(capture.last().bindings).toEqual(expect.arrayContaining(["p", "sent"]));
  });

  it("offers extra leads only for an owned, published, limited and unexpired property", async () => {
    const sql = await sqlOf(() => userSubscriptionRepository.findEligibleProperty("u", "p", NOW));

    expect(sql).toContain('"user_id" = $');
    expect(sql).toContain('"status" = $');
    expect(sql).toContain('"lead_limit" is not null');
    expect(sql).toContain('"expires_at" is null or "expires_at" > $');
    expect(capture.last().bindings).toEqual(expect.arrayContaining(["p", "u", "published"]));
  });

  it("cancels an order only while it is still open", async () => {
    const sql = await sqlOf(() => recoveryRepository.cancelOrderIfOpen("o", "reason"));

    expect(sql).toContain('"status" in ($');
    expect(capture.last().bindings).toEqual(expect.arrayContaining(["created", "pending", "cancelled"]));
  });

  it("stores a webhook event once", async () => {
    const sql = await sqlOf(() => webhookRepository.insertEventIfAbsent({ eventId: "e", type: "t", payload: {} }));

    expect(sql).toContain('on conflict ("event_id") do nothing');
  });

  it("saves the single settings row as an upsert", async () => {
    const sql = await sqlOf(() => settingsRepository.saveSettings({ gstin: "G" }));

    expect(sql).toContain('on conflict ("id") do update set');
  });

  it("moves the listings of an extended subscription only when they have an end date", async () => {
    const sql = await sqlOf(() => actionsRepository.extendPropertyExpiry(db, "s", NOW));

    expect(sql).toContain('"subscription_id" = $');
    expect(sql).toContain('"expires_at" is not null');
  });
});
