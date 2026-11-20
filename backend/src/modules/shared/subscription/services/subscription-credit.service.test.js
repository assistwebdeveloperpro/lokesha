jest.mock("../repositories/subscription.repository");
jest.mock("../repositories/subscription-ledger.repository");
jest.mock("../../../user/dashboard/user-notifications/user-notifications.repository");

const notificationRepository = require("../../../user/dashboard/user-notifications/user-notifications.repository");
const subscriptionRepository = require("../repositories/subscription.repository");
const ledgerRepository = require("../repositories/subscription-ledger.repository");
const service = require("./subscription-credit.service");

const TRX = Symbol("trx");
const NOW = new Date("2026-11-20T10:00:00.000Z");
const USER = { id: "user-1", role: "agent" };

const FREE = { id: "sub-free", total_credits: 2, used_credits: 0, lead_limit: 2, property_validity_days: 30, ends_at: null };
const STANDARD = {
  id: "sub-std",
  total_credits: 5,
  used_credits: 1,
  lead_limit: null,
  property_validity_days: null,
  ends_at: new Date("2027-01-20T10:00:00.000Z"),
};

const billingState = (overrides = {}) => ({
  id: "prop-1",
  user_id: "user-1",
  owner_role: "agent",
  credit_consumed_at: null,
  expires_at: null,
  ...overrides,
});

describe("propertyNeedsCredit", () => {
  it("is true for a never-billed listing and for one whose validity ended", () => {
    expect(service.propertyNeedsCredit(billingState(), NOW)).toBe(true);
    expect(
      service.propertyNeedsCredit(billingState({ credit_consumed_at: NOW, expires_at: new Date("2026-11-20T10:00:00.000Z") }), NOW),
    ).toBe(true);
  });

  it("is false for a billed listing that is still valid or has no end", () => {
    expect(
      service.propertyNeedsCredit(billingState({ credit_consumed_at: NOW, expires_at: new Date("2026-12-01T00:00:00.000Z") }), NOW),
    ).toBe(false);
    expect(service.propertyNeedsCredit(billingState({ credit_consumed_at: NOW }), NOW)).toBe(false);
  });
});

describe("assertCanSubmit", () => {
  beforeEach(() => {
    subscriptionRepository.findUsableSubscriptionsForUpdate.mockResolvedValue([FREE, STANDARD]);
    subscriptionRepository.countReservedProperties.mockResolvedValue(0);
  });

  it("allows a submission covered by the available credits", async () => {
    await expect(service.assertCanSubmit(TRX, USER, 6, NOW)).resolves.toBeUndefined();
    expect(subscriptionRepository.findUsableSubscriptionsForUpdate).toHaveBeenCalledWith(TRX, "user-1", NOW);
  });

  it("subtracts listings already waiting for review", async () => {
    subscriptionRepository.countReservedProperties.mockResolvedValue(5);

    await expect(service.assertCanSubmit(TRX, USER, 2, NOW)).rejects.toMatchObject({
      statusCode: 402,
      details: { code: "SUBSCRIPTION_NO_CREDITS", available: 1, required: 2 },
    });
  });

  it("rejects when the user has no usable subscription", async () => {
    subscriptionRepository.findUsableSubscriptionsForUpdate.mockResolvedValue([]);

    await expect(service.assertCanSubmit(TRX, USER, 1, NOW)).rejects.toMatchObject({ statusCode: 402 });
  });

  it("never limits admins and Lokesha staff", async () => {
    await service.assertCanSubmit(TRX, { adminId: "admin-1", role: "admin" }, 99, NOW);
    await service.assertCanSubmit(TRX, { id: "staff-1", role: "lokesha_staff" }, 99, NOW);

    expect(subscriptionRepository.findUsableSubscriptionsForUpdate).not.toHaveBeenCalled();
  });
});

describe("consumeCredit", () => {
  beforeEach(() => {
    subscriptionRepository.findPropertyBillingState.mockResolvedValue(billingState());
    subscriptionRepository.findUsableSubscriptionsForUpdate.mockResolvedValue([FREE, STANDARD]);
  });

  it("spends the first usable subscription and snapshots validity and lead limit on the property", async () => {
    const result = await service.consumeCredit(TRX, "prop-1", NOW);

    expect(result).toEqual({ subscriptionId: "sub-free" });
    expect(subscriptionRepository.incrementUsedCredits).toHaveBeenCalledWith(TRX, "sub-free");
    expect(subscriptionRepository.markPropertyBilled).toHaveBeenCalledWith(TRX, "prop-1", {
      subscriptionId: "sub-free",
      expiresAt: new Date("2026-12-20T10:00:00.000Z"),
      leadLimit: 2,
    });
    expect(ledgerRepository.insertEntry).toHaveBeenCalledWith(
      TRX,
      expect.objectContaining({ subscriptionId: "sub-free", userId: "user-1", type: "used", credits: -1, propertyId: "prop-1" }),
    );
  });

  it("warns once when the publish leaves exactly one credit", async () => {
    subscriptionRepository.findUsableSubscriptionsForUpdate.mockResolvedValue([{ ...FREE, total_credits: 2, used_credits: 0 }]);

    await service.consumeCredit(TRX, "prop-1", NOW);

    expect(notificationRepository.insertNotification).toHaveBeenCalledWith(
      TRX,
      expect.objectContaining({ user_id: "user-1", type: "credits_low" }),
    );
  });

  it.each([
    ["plenty left", [FREE, STANDARD]],
    ["the last credit being used", [{ ...FREE, total_credits: 1, used_credits: 0 }]],
  ])("sends no low credit warning with %s", async (_label, usable) => {
    subscriptionRepository.findUsableSubscriptionsForUpdate.mockResolvedValue(usable);

    await service.consumeCredit(TRX, "prop-1", NOW);

    expect(notificationRepository.insertNotification).not.toHaveBeenCalled();
  });

  it("lets a Standard listing live until the subscription ends with unlimited leads", async () => {
    subscriptionRepository.findUsableSubscriptionsForUpdate.mockResolvedValue([STANDARD]);

    await service.consumeCredit(TRX, "prop-1", NOW);

    expect(subscriptionRepository.markPropertyBilled).toHaveBeenCalledWith(TRX, "prop-1", {
      subscriptionId: "sub-std",
      expiresAt: STANDARD.ends_at,
      leadLimit: null,
    });
  });

  it("charges nothing for a listing that is already billed and still valid", async () => {
    subscriptionRepository.findPropertyBillingState.mockResolvedValue(
      billingState({ credit_consumed_at: NOW, expires_at: new Date("2026-12-01T00:00:00.000Z") }),
    );

    await expect(service.consumeCredit(TRX, "prop-1", NOW)).resolves.toBeNull();
    expect(subscriptionRepository.incrementUsedCredits).not.toHaveBeenCalled();
    expect(ledgerRepository.insertEntry).not.toHaveBeenCalled();
  });

  it("charges a new credit when a closed listing is reopened after its validity ended", async () => {
    subscriptionRepository.findPropertyBillingState.mockResolvedValue(
      billingState({ credit_consumed_at: new Date("2026-09-01T00:00:00.000Z"), expires_at: new Date("2026-10-01T00:00:00.000Z") }),
    );

    await expect(service.consumeCredit(TRX, "prop-1", NOW)).resolves.toEqual({ subscriptionId: "sub-free" });
  });

  it.each([
    ["an admin listing", billingState({ user_id: null, owner_role: null })],
    ["a Lokesha staff listing", billingState({ owner_role: "lokesha_staff" })],
    ["a missing property", undefined],
  ])("charges nothing for %s", async (_label, state) => {
    subscriptionRepository.findPropertyBillingState.mockResolvedValue(state);

    await expect(service.consumeCredit(TRX, "prop-1", NOW)).resolves.toBeNull();
    expect(subscriptionRepository.findUsableSubscriptionsForUpdate).not.toHaveBeenCalled();
  });

  it("fails the approval when the owner has no credits left", async () => {
    subscriptionRepository.findUsableSubscriptionsForUpdate.mockResolvedValue([]);

    await expect(service.consumeCredit(TRX, "prop-1", NOW)).rejects.toMatchObject({
      statusCode: 409,
      details: { code: "SUBSCRIPTION_NO_CREDITS" },
    });
    expect(subscriptionRepository.markPropertyBilled).not.toHaveBeenCalled();
  });
});
