const FREE_MOBILE_INDEX = "user_subscriptions_free_signup_mobile_unique";
const FREE_USER_INDEX = "user_subscriptions_free_signup_user_unique";

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("user_subscriptions", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("RESTRICT");
    table.uuid("package_id").notNullable().references("id").inTable("subscription_packages").onDelete("RESTRICT");
    table.string("source", 20).notNullable();
    table.uuid("order_id").nullable().references("id").inTable("subscription_orders").onDelete("RESTRICT");
    table.integer("total_credits").notNullable();
    table.integer("used_credits").notNullable().defaultTo(0);
    table.integer("lead_limit").nullable();
    table.integer("property_validity_days").nullable();
    table.timestamp("starts_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("ends_at").nullable();
    table.string("status", 12).notNullable().defaultTo("active");
    table.string("mobile_number", 20).nullable();
    table.timestamp("reminder_7d_sent_at").nullable();
    table.timestamp("reminder_1d_sent_at").nullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.index(["user_id", "status", "ends_at"], "user_subscriptions_user_status_ends_idx");
    table.index(["status", "ends_at"], "user_subscriptions_status_ends_idx");
  });

  await knex.raw(`
    ALTER TABLE user_subscriptions
      ADD CONSTRAINT user_subscriptions_source_check CHECK (source IN ('free_signup','purchase','admin_gift','launch_backfill')),
      ADD CONSTRAINT user_subscriptions_status_check CHECK (status IN ('active','exhausted','expired','cancelled','refunded')),
      ADD CONSTRAINT user_subscriptions_credits_check CHECK (used_credits >= 0 AND used_credits <= total_credits),
      ADD CONSTRAINT user_subscriptions_period_check CHECK (ends_at IS NULL OR ends_at > starts_at)
  `);

  // One Free package per mobile number and per user, even after account deletion
  await knex.raw(
    `CREATE UNIQUE INDEX ${FREE_MOBILE_INDEX} ON user_subscriptions (mobile_number) WHERE source IN ('free_signup','launch_backfill')`,
  );
  await knex.raw(
    `CREATE UNIQUE INDEX ${FREE_USER_INDEX} ON user_subscriptions (user_id) WHERE source IN ('free_signup','launch_backfill')`,
  );
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.raw(`DROP INDEX IF EXISTS ${FREE_USER_INDEX}`);
  await knex.raw(`DROP INDEX IF EXISTS ${FREE_MOBILE_INDEX}`);
  await knex.schema.dropTableIfExists("user_subscriptions");
};
