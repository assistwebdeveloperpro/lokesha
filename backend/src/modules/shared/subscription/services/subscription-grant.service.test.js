jest.mock("../repositories/subscription.repository");
jest.mock("../repositories/subscription-ledger.repository");
jest.mock("../../../user/dashboard/user-notifications/user-notifications.repository");

const subscriptionRepository = require("../repositories/subscription.repository");
const ledgerRepository = require("../repositories/subscription-ledger.repository");
const notificationRepository = require("../../../user/dashboard/user-notifications/user-notifications.repository");
const { grantFreePackage } = require("./subscription-grant.service");

const TRX = Symbol("trx");
const USER = { id: "user-1", mobile_number: "9876543210" };
const FREE_PACKAGE = { id: "pkg-free", free_credits: 2, free_lead_limit: 2, free_property_validity_days: 30 };

describe("grantFreePackage", () => {
  beforeEach(() => {
    subscriptionRepository.findActivePackageByCode.mockResolvedValue(FREE_PACKAGE);
    subscriptionRepository.insertSubscriptionIfAbsent.mockImplementation(async (_trx, row) => ({ id: "sub-1", ...row }));
  });

  it("snapshots the package into a subscription, then writes the ledger and the welcome notification", async () => {
    const subscription = await grantFreePackage(TRX, USER);

    expect(subscriptionRepository.findActivePackageByCode).toHaveBeenCalledWith(TRX, "free");
    expect(subscriptionRepository.insertSubscriptionIfAbsent).toHaveBeenCalledWith(
      TRX,
      expect.objectContaining({
        user_id: "user-1",
        package_id: "pkg-free",
        source: "free_signup",
        total_credits: 2,
        lead_limit: 2,
        property_validity_days: 30,
        mobile_number: "9876543210",
      }),
    );
    expect(subscription.id).toBe("sub-1");
    expect(ledgerRepository.insertEntry).toHaveBeenCalledWith(
      TRX,
      expect.objectContaining({ subscriptionId: "sub-1", userId: "user-1", type: "granted", credits: 2 }),
    );
    expect(notificationRepository.insertNotification).toHaveBeenCalledWith(
      TRX,
      expect.objectContaining({ user_id: "user-1", type: "free_package_granted", message: expect.stringContaining("2 free listings") }),
    );
  });

  it("grants nothing when the Free package is missing, inactive or has no credits", async () => {
    subscriptionRepository.findActivePackageByCode.mockResolvedValueOnce(null);
    await expect(grantFreePackage(TRX, USER)).resolves.toBeNull();

    subscriptionRepository.findActivePackageByCode.mockResolvedValueOnce({ ...FREE_PACKAGE, free_credits: 0 });
    await expect(grantFreePackage(TRX, USER)).resolves.toBeNull();

    expect(subscriptionRepository.insertSubscriptionIfAbsent).not.toHaveBeenCalled();
  });

  it("writes no ledger row or notification when the user already has a Free package", async () => {
    subscriptionRepository.insertSubscriptionIfAbsent.mockResolvedValue(null);

    await expect(grantFreePackage(TRX, USER)).resolves.toBeNull();
    expect(ledgerRepository.insertEntry).not.toHaveBeenCalled();
    expect(notificationRepository.insertNotification).not.toHaveBeenCalled();
  });

  it("skips the welcome notification for the launch backfill", async () => {
    await grantFreePackage(TRX, USER, "launch_backfill");

    expect(subscriptionRepository.insertSubscriptionIfAbsent).toHaveBeenCalledWith(TRX, expect.objectContaining({ source: "launch_backfill" }));
    expect(ledgerRepository.insertEntry).toHaveBeenCalled();
    expect(notificationRepository.insertNotification).not.toHaveBeenCalled();
  });
});
