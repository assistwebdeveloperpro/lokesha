const mockTrx = {};

jest.mock("../../../../config/db", () => ({
  db: { transaction: jest.fn((callback) => callback(mockTrx)) },
}));
jest.mock("../repositories/subscription-expiry.repository");
jest.mock("../repositories/subscription-ledger.repository");
jest.mock("../../../user/dashboard/user-notifications/user-notifications.repository");
jest.mock("../../property/services/property-status.service");

const expiryRepository = require("../repositories/subscription-expiry.repository");
const ledgerRepository = require("../repositories/subscription-ledger.repository");
const notificationRepository = require("../../../user/dashboard/user-notifications/user-notifications.repository");
const { changeStatus } = require("../../property/services/property-status.service");
const { runExpiry, runReminders } = require("./subscription-expiry.service");

const NOW = new Date("2026-11-20T10:00:00.000Z");
const HOUR_MS = 60 * 60 * 1000;
const inHours = (hours) => new Date(NOW.getTime() + hours * HOUR_MS);

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  expiryRepository.findExpiredSubscriptionIds.mockResolvedValue([]);
  expiryRepository.findExpiredPropertyIds.mockResolvedValue([]);
  expiryRepository.findDueReminderIds.mockResolvedValue([]);
});

describe("runExpiry: subscriptions", () => {
  const subscription = { id: "sub-1", user_id: "user-1", total_credits: 5, used_credits: 2 };

  beforeEach(() => {
    expiryRepository.findExpiredSubscriptionIds.mockResolvedValue(["sub-1"]);
    expiryRepository.lockExpiredSubscription.mockResolvedValue(subscription);
    expiryRepository.findLivePropertiesOfSubscription.mockResolvedValue([
      { id: "p-1", user_id: "user-1", title: "Sky Heights" },
      { id: "p-2", user_id: "user-1", title: "Green Villa" },
    ]);
  });

  it("expires the subscription, loses the unused credits, closes its live properties and tells the user once", async () => {
    const result = await runExpiry(NOW);

    expect(expiryRepository.lockExpiredSubscription).toHaveBeenCalledWith(mockTrx, "sub-1", NOW);
    expect(expiryRepository.markSubscriptionExpired).toHaveBeenCalledWith(mockTrx, "sub-1");
    expect(ledgerRepository.insertEntry).toHaveBeenCalledWith(mockTrx, {
      subscriptionId: "sub-1",
      userId: "user-1",
      type: "expired",
      credits: -3,
      reason: "Subscription ended",
    });
    expect(changeStatus).toHaveBeenCalledTimes(2);
    expect(changeStatus).toHaveBeenCalledWith(mockTrx, {
      propertyId: "p-1",
      from: "published",
      to: "closed",
      actor: {},
      reason: "Subscription ended",
    });
    expect(notificationRepository.insertNotification).toHaveBeenCalledTimes(1);
    expect(notificationRepository.insertNotification).toHaveBeenCalledWith(
      mockTrx,
      expect.objectContaining({ user_id: "user-1", type: "subscription_ended", message: expect.stringContaining("2 properties are now offline") }),
    );
    expect(result).toEqual({ expiredSubscriptions: 1, closedProperties: 0 });
  });

  it("writes no ledger row when every credit was used", async () => {
    expiryRepository.lockExpiredSubscription.mockResolvedValue({ ...subscription, used_credits: 5 });

    await runExpiry(NOW);

    expect(ledgerRepository.insertEntry).not.toHaveBeenCalled();
    expect(expiryRepository.markSubscriptionExpired).toHaveBeenCalled();
  });

  it("does nothing for a subscription another run already handled", async () => {
    expiryRepository.lockExpiredSubscription.mockResolvedValue(undefined);

    await expect(runExpiry(NOW)).resolves.toEqual({ expiredSubscriptions: 0, closedProperties: 0 });
    expect(expiryRepository.markSubscriptionExpired).not.toHaveBeenCalled();
    expect(notificationRepository.insertNotification).not.toHaveBeenCalled();
  });

  it("keeps going when one subscription fails", async () => {
    expiryRepository.findExpiredSubscriptionIds.mockResolvedValue(["sub-bad", "sub-1"]);
    expiryRepository.lockExpiredSubscription.mockRejectedValueOnce(new Error("deadlock")).mockResolvedValueOnce(subscription);

    await expect(runExpiry(NOW)).resolves.toMatchObject({ expiredSubscriptions: 1 });
    expect(console.error).toHaveBeenCalledWith("Subscription job failed for subscription sub-bad:", "deadlock");
  });
});

describe("runExpiry: listings past their own validity", () => {
  beforeEach(() => {
    expiryRepository.findExpiredPropertyIds.mockResolvedValue(["p-1"]);
  });

  it("closes a Free listing and tells the owner", async () => {
    expiryRepository.lockExpiredProperty.mockResolvedValue({ id: "p-1", user_id: "user-1", title: "Sky Heights", subscription_ends_at: null });

    const result = await runExpiry(NOW);

    expect(changeStatus).toHaveBeenCalledWith(mockTrx, expect.objectContaining({ propertyId: "p-1", to: "closed", reason: "Listing validity ended" }));
    expect(notificationRepository.insertNotification).toHaveBeenCalledWith(
      mockTrx,
      expect.objectContaining({ user_id: "user-1", type: "property_expired", property_id: "p-1" }),
    );
    expect(result.closedProperties).toBe(1);
  });

  it("closes a paid listing without its own notice, the subscription notice covers it", async () => {
    expiryRepository.lockExpiredProperty.mockResolvedValue({ id: "p-1", user_id: "user-1", title: "T", subscription_ends_at: NOW });

    await runExpiry(NOW);

    expect(changeStatus).toHaveBeenCalled();
    expect(notificationRepository.insertNotification).not.toHaveBeenCalled();
  });

  it("skips a listing that is no longer live", async () => {
    expiryRepository.lockExpiredProperty.mockResolvedValue(undefined);

    await expect(runExpiry(NOW)).resolves.toMatchObject({ closedProperties: 0 });
    expect(changeStatus).not.toHaveBeenCalled();
  });
});

describe("runReminders", () => {
  const subscription = (endsInHours, overrides = {}) => ({
    id: "sub-1",
    user_id: "user-1",
    ends_at: inHours(endsInHours),
    reminder_7d_sent_at: null,
    reminder_1d_sent_at: null,
    ...overrides,
  });

  beforeEach(() => expiryRepository.findDueReminderIds.mockResolvedValue(["sub-1"]));

  it("looks seven days ahead", async () => {
    await runReminders(NOW);

    expect(expiryRepository.findDueReminderIds).toHaveBeenCalledWith(NOW, new Date("2026-11-27T10:00:00.000Z"), 100);
  });

  it("sends the seven day reminder once and marks only that one", async () => {
    expiryRepository.lockSubscriptionForReminder.mockResolvedValue(subscription(6 * 24));

    await expect(runReminders(NOW)).resolves.toEqual({ remindersSent: 1 });

    expect(notificationRepository.insertNotification).toHaveBeenCalledWith(
      mockTrx,
      expect.objectContaining({ user_id: "user-1", type: "subscription_ending_soon", title: "Your subscription ends in 6 days" }),
    );
    expect(expiryRepository.markRemindersSent).toHaveBeenCalledWith(mockTrx, "sub-1", { sevenDay: true, oneDay: false });
  });

  it("sends the last-day reminder and marks both, so a short subscription is not reminded twice", async () => {
    expiryRepository.lockSubscriptionForReminder.mockResolvedValue(subscription(20));

    await runReminders(NOW);

    expect(notificationRepository.insertNotification).toHaveBeenCalledWith(mockTrx, expect.objectContaining({ title: "Your subscription ends tomorrow" }));
    expect(expiryRepository.markRemindersSent).toHaveBeenCalledWith(mockTrx, "sub-1", { sevenDay: true, oneDay: true });
  });

  it("sends the last-day reminder after the seven day one", async () => {
    expiryRepository.lockSubscriptionForReminder.mockResolvedValue(subscription(20, { reminder_7d_sent_at: inHours(-100) }));

    await expect(runReminders(NOW)).resolves.toEqual({ remindersSent: 1 });
  });

  it.each([
    ["the seven day one was already sent", subscription(6 * 24, { reminder_7d_sent_at: inHours(-1) })],
    ["the last-day one was already sent", subscription(20, { reminder_1d_sent_at: inHours(-1) })],
    ["the subscription already ended", subscription(-1)],
    ["it ends later than a week", subscription(8 * 24)],
    ["the subscription is gone", undefined],
  ])("sends nothing when %s", async (_label, locked) => {
    expiryRepository.lockSubscriptionForReminder.mockResolvedValue(locked);

    await expect(runReminders(NOW)).resolves.toEqual({ remindersSent: 0 });
    expect(notificationRepository.insertNotification).not.toHaveBeenCalled();
    expect(expiryRepository.markRemindersSent).not.toHaveBeenCalled();
  });
});
