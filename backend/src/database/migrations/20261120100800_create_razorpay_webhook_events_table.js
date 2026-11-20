/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("razorpay_webhook_events", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("event_id", 80).notNullable().unique();
    table.string("type", 60).notNullable();
    table.jsonb("payload").notNullable();
    table.timestamp("processed_at").nullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("razorpay_webhook_events");
};
