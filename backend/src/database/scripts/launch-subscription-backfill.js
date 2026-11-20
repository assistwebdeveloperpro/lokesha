const { db } = require("../../config/db");
const { runLaunchBackfill } = require("../../modules/shared/subscription/services/subscription-backfill.service");

const DRY_RUN_FLAG = "--dry-run";

async function main() {
  const dryRun = process.argv.includes(DRY_RUN_FLAG);
  const result = await runLaunchBackfill({ dryRun });

  console.log(dryRun ? "Dry run, nothing was changed." : "Backfill finished.");
  console.log(`Users without a Free package: ${result.pending}`);
  if (!dryRun) console.log(`Granted: ${result.granted}, skipped: ${result.skipped}, failed: ${result.failed}`);

  return result;
}

main()
  .then((result) => {
    process.exitCode = result.failed > 0 ? 1 : 0;
  })
  .catch((error) => {
    console.error("Backfill stopped:", error.message);
    process.exitCode = 1;
  })
  .finally(() => db.destroy());
