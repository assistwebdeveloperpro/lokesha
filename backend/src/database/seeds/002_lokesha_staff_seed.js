/** @param {import('knex').Knex} knex */
exports.seed = async function seed(knex) {
  await knex("users")
    .insert({
      role: "lokesha_staff",
      name: "Lokesha Staff",
      email: "staff@lokesha.com",
      mobile_number: "9876543211",
      agreed_to_terms: true,
    })
    .onConflict("mobile_number")
    .ignore();
};
