/** @param {import('knex').Knex} knex */
exports.seed = async function seed(knex) {
  await knex("admins")
    .insert({ name: "Lokesha Realty", mobile_number: "9876543210" })
    .onConflict("mobile_number")
    .ignore();
};
