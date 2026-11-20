const SUBSCRIPTION_INDEX = "properties_subscription_id_idx";
const EXPIRES_INDEX = "properties_expires_at_idx";

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.alterTable("properties", (table) => {
    table.uuid("subscription_id").nullable().references("id").inTable("user_subscriptions").onDelete("SET NULL");
    table.timestamp("credit_consumed_at").nullable();
    table.integer("lead_limit").nullable();
    table.timestamp("expires_at").nullable();
    table.index(["subscription_id"], SUBSCRIPTION_INDEX);
    table.index(["expires_at"], EXPIRES_INDEX);
  });

  // Listings already live before launch stay free of credits
  await knex("properties")
    .whereIn("status", ["published", "closed"])
    .update({ credit_consumed_at: knex.raw("coalesce(published_at, updated_at)") });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.alterTable("properties", (table) => {
    table.dropIndex(["expires_at"], EXPIRES_INDEX);
    table.dropIndex(["subscription_id"], SUBSCRIPTION_INDEX);
    table.dropColumn("expires_at");
    table.dropColumn("lead_limit");
    table.dropColumn("credit_consumed_at");
    table.dropColumn("subscription_id");
  });
};
