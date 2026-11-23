const OLD_QUANTITY_CHECK = "subscription_orders_quantity_check";
const TYPE_CHECK = "subscription_orders_order_type_check";
const PROPERTY_INDEX = "subscription_orders_property_idx";

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.alterTable("subscription_orders", (table) => {
    table.string("order_type", 12).notNullable().defaultTo("subscription");
    table.uuid("property_id").nullable().references("id").inTable("properties").onDelete("RESTRICT");
    table.integer("leads").nullable();
    table.integer("price_per_lead").nullable();
    table.integer("listings").nullable().alter();
    table.integer("months").nullable().alter();
    table.integer("price_per_listing_month").nullable().alter();
    table.index(["property_id"], PROPERTY_INDEX);
  });

  await knex.raw(`
    ALTER TABLE subscription_orders
      DROP CONSTRAINT ${OLD_QUANTITY_CHECK},
      ADD CONSTRAINT ${TYPE_CHECK} CHECK (order_type IN ('subscription','lead_pack')),
      ADD CONSTRAINT ${OLD_QUANTITY_CHECK} CHECK (
        (order_type = 'subscription' AND listings >= 1 AND months >= 1)
        OR (order_type = 'lead_pack' AND leads >= 1 AND property_id IS NOT NULL)
      )
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  // Fails on purpose when lead orders exist, paid records are never deleted here
  await knex.raw(`
    ALTER TABLE subscription_orders
      DROP CONSTRAINT ${OLD_QUANTITY_CHECK},
      DROP CONSTRAINT ${TYPE_CHECK},
      ADD CONSTRAINT ${OLD_QUANTITY_CHECK} CHECK (listings >= 1 AND months >= 1)
  `);

  await knex.schema.alterTable("subscription_orders", (table) => {
    table.dropIndex(["property_id"], PROPERTY_INDEX);
    table.integer("price_per_listing_month").notNullable().alter();
    table.integer("months").notNullable().alter();
    table.integer("listings").notNullable().alter();
    table.dropColumn("price_per_lead");
    table.dropColumn("leads");
    table.dropColumn("property_id");
    table.dropColumn("order_type");
  });
};
