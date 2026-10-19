const { hashPassword } = require("../../utils/bcrypt");

/** @param {import('knex').Knex} knex */
exports.seed = async function seed(knex) {
  const password = await hashPassword(
    process.env.LOKESHA_STAFF_PASSWORD || "Staff@12345"
  );

  await knex("users")
    .insert({
      role: "lokesha_staff",
      name: "Lokesha Staff",
      email: "staff@lokesha.com",
      password,
      mobile_number: "9876543211",
      agreed_to_terms: true,
    })
    .onConflict("mobile_number")
    .ignore();
};
