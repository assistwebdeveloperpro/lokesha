const repository = require("../repositories/subscription-backfill.repository");
const { grantFreePackage } = require("./subscription-grant.service");
const { SUBSCRIPTION_SOURCES } = require("../constants/subscription.constants");

const DEFAULT_BATCH_SIZE = 200;
const NOT_READY_MESSAGE = "The Free package is not set up or has no credits. Run the packages seed first.";

// Gives every existing user a Free package once; live properties are not touched or counted against credits
async function runLaunchBackfill({ dryRun = false, batchSize = DEFAULT_BATCH_SIZE, log = console } = {}) {
  const freePackage = await repository.findActiveFreePackage();
  if (!freePackage || !freePackage.free_credits) throw new Error(NOT_READY_MESSAGE);

  const pending = await repository.countUsersWithoutFreePackage();
  const result = { pending, granted: 0, skipped: 0, failed: 0 };
  if (dryRun) return result;

  let cursor = null;
  for (;;) {
    const users = await repository.findUsersWithoutFreePackage({ after: cursor, limit: batchSize });
    if (!users.length) break;

    for (const user of users) {
      try {
        // Each user is its own transaction, so one failure never undoes the others
        const subscription = await repository.runInTransaction((trx) => grantFreePackage(trx, user, SUBSCRIPTION_SOURCES.LAUNCH_BACKFILL));
        result[subscription ? "granted" : "skipped"] += 1;
      } catch (error) {
        result.failed += 1;
        log.error(`Backfill failed for user ${user.id}:`, error.message);
      }
    }

    cursor = users[users.length - 1].id;
    log.log(`Backfill progress: ${result.granted} granted, ${result.skipped} skipped, ${result.failed} failed of ${pending}`);
  }

  return result;
}

module.exports = { runLaunchBackfill };
