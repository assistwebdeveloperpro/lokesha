const { runExpiry, runReminders } = require("./subscription-expiry.service");
const { recoverPendingPayments } = require("./subscription-recovery.service");

const INTERVAL_MS = 10 * 60 * 1000;
const STARTUP_DELAY_MS = 30 * 1000;

const DEFAULT_JOBS = [
  { name: "expiry", run: runExpiry },
  { name: "reminders", run: runReminders },
  { name: "payment recovery", run: recoverPendingPayments },
];

const hasWork = (result) => Object.values(result ?? {}).some((value) => value > 0);

function createSubscriptionJobRunner({ jobs = DEFAULT_JOBS, log = console } = {}) {
  let isRunning = false;

  return async function runAll() {
    if (isRunning) return false;

    isRunning = true;
    try {
      for (const { name, run } of jobs) {
        try {
          const result = await run();
          if (hasWork(result)) log.log(`Subscription ${name}:`, JSON.stringify(result));
        } catch (error) {
          log.error(`Subscription ${name} failed:`, error.message);
        }
      }
    } finally {
      isRunning = false;
    }
    return true;
  };
}


function scheduleSubscriptionJobs() {
  const runAll = createSubscriptionJobRunner();

  setTimeout(runAll, STARTUP_DELAY_MS).unref();
  return setInterval(runAll, INTERVAL_MS).unref();
}

module.exports = { createSubscriptionJobRunner, scheduleSubscriptionJobs };
