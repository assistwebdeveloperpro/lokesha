jest.mock("../../../../config/db", () => ({ db: {} }));
jest.mock("./subscription-expiry.service");
jest.mock("./subscription-recovery.service");

const { createSubscriptionJobRunner } = require("./subscription-jobs.service");

const buildLog = () => ({ log: jest.fn(), error: jest.fn() });

describe("createSubscriptionJobRunner", () => {
  it("runs every job in order", async () => {
    const order = [];
    const jobs = [
      { name: "first", run: jest.fn(async () => order.push("first")) },
      { name: "second", run: jest.fn(async () => order.push("second")) },
    ];

    await expect(createSubscriptionJobRunner({ jobs, log: buildLog() })()).resolves.toBe(true);

    expect(order).toEqual(["first", "second"]);
  });

  it("reports a job that did work and stays quiet about one that did not", async () => {
    const log = buildLog();
    const jobs = [
      { name: "expiry", run: async () => ({ expiredSubscriptions: 2, closedProperties: 0 }) },
      { name: "reminders", run: async () => ({ remindersSent: 0 }) },
    ];

    await createSubscriptionJobRunner({ jobs, log })();

    expect(log.log).toHaveBeenCalledTimes(1);
    expect(log.log).toHaveBeenCalledWith("Subscription expiry:", '{"expiredSubscriptions":2,"closedProperties":0}');
  });

  it("keeps running the other jobs when one fails", async () => {
    const log = buildLog();
    const second = jest.fn().mockResolvedValue({});
    const jobs = [
      { name: "first", run: jest.fn().mockRejectedValue(new Error("db down")) },
      { name: "second", run: second },
    ];

    await createSubscriptionJobRunner({ jobs, log })();

    expect(second).toHaveBeenCalled();
    expect(log.error).toHaveBeenCalledWith("Subscription first failed:", "db down");
  });

  it("skips a run that starts while the previous one is still going, then runs again once it ends", async () => {
    let release;
    const slow = jest.fn(() => new Promise((resolve) => (release = resolve)));
    const runAll = createSubscriptionJobRunner({ jobs: [{ name: "slow", run: slow }], log: buildLog() });

    const firstRun = runAll();
    await expect(runAll()).resolves.toBe(false);
    expect(slow).toHaveBeenCalledTimes(1);

    release({});
    await firstRun;
    slow.mockResolvedValue({});
    await expect(runAll()).resolves.toBe(true);
    expect(slow).toHaveBeenCalledTimes(2);
  });

  it("can run again after a failure", async () => {
    const job = jest.fn().mockRejectedValueOnce(new Error("boom")).mockResolvedValue({});
    const runAll = createSubscriptionJobRunner({ jobs: [{ name: "job", run: job }], log: buildLog() });

    await runAll();
    await expect(runAll()).resolves.toBe(true);
    expect(job).toHaveBeenCalledTimes(2);
  });
});
