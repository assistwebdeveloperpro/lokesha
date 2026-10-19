const ROLE_ENUM_NAME = "user_role";
const NEW_ROLE = "lokesha_staff";

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.raw(
    `ALTER TYPE ${ROLE_ENUM_NAME} ADD VALUE IF NOT EXISTS '${NEW_ROLE}'`
  );
};

/** @param {import('knex').Knex} knex */
exports.down = async function down() {
};
