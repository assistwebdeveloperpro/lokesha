const { db } = require("../../../../config/db");
const subscriptionRepository = require("./subscription.repository");
const { PACKAGE_CODES } = require("../constants/subscription.constants");

const STAFF_ROLE = "lokesha_staff";
const FREE_SOURCES = ["free_signup", "launch_backfill"];

const runInTransaction = (callback) => db.transaction(callback);

const findActiveFreePackage = () => subscriptionRepository.findActivePackageByCode(db, PACKAGE_CODES.FREE);

// Staff never use credits, and a user who already has a Free package is left out, so a second run grants nothing twice
function usersWithoutFreePackage() {
  return db("users as u")
    .whereNot("u.role", STAFF_ROLE)
    .whereNotExists(function hasFreePackage() {
      this.select(db.raw("1")).from("user_subscriptions as s").whereRaw("s.user_id = u.id").whereIn("s.source", FREE_SOURCES);
    });
}

async function countUsersWithoutFreePackage() {
  const [{ count }] = await usersWithoutFreePackage().count("u.id as count");
  return Number(count);
}

// Walks the users by id, so one that cannot be granted never makes the run loop
async function findUsersWithoutFreePackage({ after, limit }) {
  const query = usersWithoutFreePackage().orderBy("u.id", "asc").limit(limit).select("u.id", "u.mobile_number");
  if (after) query.where("u.id", ">", after);

  return query;
}

module.exports = {
  buildUsersQuery: usersWithoutFreePackage,
  runInTransaction,
  findActiveFreePackage,
  countUsersWithoutFreePackage,
  findUsersWithoutFreePackage,
};
