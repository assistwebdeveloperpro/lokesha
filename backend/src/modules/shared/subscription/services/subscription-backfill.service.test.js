jest.mock("../repositories/subscription-backfill.repository");
jest.mock("./subscription-grant.service");

const repository = require("../repositories/subscription-backfill.repository");
const { grantFreePackage } = require("./subscription-grant.service");
const { runLaunchBackfill } = require("./subscription-backfill.service");

const TRX = Symbol("trx");
const user = (id) => ({ id, mobile_number: `90000000${id}` });
const buildLog = () => ({ log: jest.fn(), error: jest.fn() });

beforeEach(() => {
  repository.findActiveFreePackage.mockResolvedValue({ id: "pkg-free", free_credits: 2 });
  repository.countUsersWithoutFreePackage.mockResolvedValue(3);
  repository.runInTransaction.mockImplementation((callback) => callback(TRX));
  repository.findUsersWithoutFreePackage.mockResolvedValueOnce([user("1"), user("2"), user("3")]).mockResolvedValue([]);
  grantFreePackage.mockImplementation(async (_trx, { id }) => ({ id: `sub-${id}` }));
});

describe("runLaunchBackfill", () => {
  it("grants the Free package to each user as a launch backfill, in its own transaction", async () => {
    const result = await runLaunchBackfill({ log: buildLog() });

    expect(result).toEqual({ pending: 3, granted: 3, skipped: 0, failed: 0 });
    expect(repository.runInTransaction).toHaveBeenCalledTimes(3);
    expect(grantFreePackage).toHaveBeenCalledWith(TRX, user("1"), "launch_backfill");
    expect(grantFreePackage).toHaveBeenCalledWith(TRX, user("3"), "launch_backfill");
  });

  it("walks the users in batches by id until none are left", async () => {
    repository.findUsersWithoutFreePackage.mockReset();
    repository.findUsersWithoutFreePackage
      .mockResolvedValueOnce([user("1"), user("2")])
      .mockResolvedValueOnce([user("3")])
      .mockResolvedValue([]);

    await runLaunchBackfill({ batchSize: 2, log: buildLog() });

    expect(repository.findUsersWithoutFreePackage.mock.calls.map(([args]) => args)).toEqual([
      { after: null, limit: 2 },
      { after: "2", limit: 2 },
      { after: "3", limit: 2 },
    ]);
  });

  it("counts a user who already has a Free package as skipped", async () => {
    grantFreePackage.mockImplementation(async (_trx, { id }) => (id === "2" ? null : { id: `sub-${id}` }));

    await expect(runLaunchBackfill({ log: buildLog() })).resolves.toEqual({ pending: 3, granted: 2, skipped: 1, failed: 0 });
  });

  it("keeps going and reports it when one user fails", async () => {
    const log = buildLog();
    grantFreePackage.mockImplementation(async (_trx, { id }) => {
      if (id === "2") throw new Error("db error");
      return { id: `sub-${id}` };
    });

    await expect(runLaunchBackfill({ log })).resolves.toEqual({ pending: 3, granted: 2, skipped: 0, failed: 1 });
    expect(log.error).toHaveBeenCalledWith("Backfill failed for user 2:", "db error");
  });

  it("only counts what would be granted on a dry run and changes nothing", async () => {
    await expect(runLaunchBackfill({ dryRun: true, log: buildLog() })).resolves.toEqual({ pending: 3, granted: 0, skipped: 0, failed: 0 });

    expect(repository.findUsersWithoutFreePackage).not.toHaveBeenCalled();
    expect(grantFreePackage).not.toHaveBeenCalled();
  });

  it.each([
    ["missing or inactive", undefined],
    ["without credits", { id: "pkg-free", free_credits: 0 }],
  ])("stops before touching anyone when the Free package is %s", async (_label, freePackage) => {
    repository.findActiveFreePackage.mockResolvedValue(freePackage);

    await expect(runLaunchBackfill({ log: buildLog() })).rejects.toThrow("Free package is not set up");
    expect(repository.countUsersWithoutFreePackage).not.toHaveBeenCalled();
    expect(grantFreePackage).not.toHaveBeenCalled();
  });

  it("does nothing when everyone already has a Free package", async () => {
    repository.countUsersWithoutFreePackage.mockResolvedValue(0);
    repository.findUsersWithoutFreePackage.mockReset();
    repository.findUsersWithoutFreePackage.mockResolvedValue([]);

    await expect(runLaunchBackfill({ log: buildLog() })).resolves.toEqual({ pending: 0, granted: 0, skipped: 0, failed: 0 });
    expect(grantFreePackage).not.toHaveBeenCalled();
  });
});
