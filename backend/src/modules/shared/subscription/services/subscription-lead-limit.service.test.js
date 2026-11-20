jest.mock("../repositories/subscription.repository");
jest.mock("../../../user/dashboard/user-notifications/user-notifications.repository");

const subscriptionRepository = require("../repositories/subscription.repository");
const notificationRepository = require("../../../user/dashboard/user-notifications/user-notifications.repository");
const { assertLeadCapacity, notifyLeadProgress } = require("./subscription-lead-limit.service");

const TRX = Symbol("trx");
const PROPERTY = { id: "prop-1", user_id: "user-1", title: "Sky Heights" };

describe("assertLeadCapacity", () => {
  it("allows any number of leads when the property has no limit", async () => {
    subscriptionRepository.findLeadLimitForUpdate.mockResolvedValue(null);

    await expect(assertLeadCapacity(TRX, "prop-1")).resolves.toEqual({ limit: null, received: 0 });
    expect(subscriptionRepository.countPropertyLeads).not.toHaveBeenCalled();
  });

  it("allows a lead while the limit is not used", async () => {
    subscriptionRepository.findLeadLimitForUpdate.mockResolvedValue(2);
    subscriptionRepository.countPropertyLeads.mockResolvedValue(1);

    await expect(assertLeadCapacity(TRX, "prop-1")).resolves.toEqual({ limit: 2, received: 1 });
    expect(subscriptionRepository.findLeadLimitForUpdate).toHaveBeenCalledWith(TRX, "prop-1");
  });

  it.each([2, 3])("refuses a new lead once %i leads are received", async (received) => {
    subscriptionRepository.findLeadLimitForUpdate.mockResolvedValue(2);
    subscriptionRepository.countPropertyLeads.mockResolvedValue(received);

    await expect(assertLeadCapacity(TRX, "prop-1")).rejects.toMatchObject({
      statusCode: 409,
      details: { code: "PROPERTY_LEAD_LIMIT_REACHED" },
    });
  });
});

describe("notifyLeadProgress", () => {
  it("warns the lister when one lead is left", async () => {
    await notifyLeadProgress(TRX, PROPERTY, { limit: 3, received: 1 });

    expect(notificationRepository.insertNotification).toHaveBeenCalledWith(
      TRX,
      expect.objectContaining({ user_id: "user-1", type: "lead_limit_near", property_id: "prop-1", title: "Sky Heights" }),
    );
  });

  it("tells the lister when the limit is used", async () => {
    await notifyLeadProgress(TRX, PROPERTY, { limit: 2, received: 1 });

    expect(notificationRepository.insertNotification).toHaveBeenCalledTimes(1);
    expect(notificationRepository.insertNotification).toHaveBeenCalledWith(
      TRX,
      expect.objectContaining({ type: "lead_limit_reached", message: expect.stringContaining("all 2 leads") }),
    );
  });

  it("stays quiet before the last lead and for the first of a one-lead limit", async () => {
    await notifyLeadProgress(TRX, PROPERTY, { limit: 5, received: 1 });
    expect(notificationRepository.insertNotification).not.toHaveBeenCalled();

    await notifyLeadProgress(TRX, PROPERTY, { limit: 1, received: 0 });
    expect(notificationRepository.insertNotification).toHaveBeenCalledTimes(1);
    expect(notificationRepository.insertNotification).toHaveBeenCalledWith(TRX, expect.objectContaining({ type: "lead_limit_reached" }));
  });

  it("sends nothing for unlimited and admin listings", async () => {
    await notifyLeadProgress(TRX, PROPERTY, { limit: null, received: 0 });
    await notifyLeadProgress(TRX, { ...PROPERTY, user_id: null }, { limit: 2, received: 1 });

    expect(notificationRepository.insertNotification).not.toHaveBeenCalled();
  });
});
