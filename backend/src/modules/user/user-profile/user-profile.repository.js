const { db } = require("../../../config/db");

const USERS_TABLE = "users";
const OFFICE_TABLE = "user_office_details";

async function findProfileByUserId(userId) {
  return db(USERS_TABLE)
    .leftJoin(OFFICE_TABLE, `${OFFICE_TABLE}.user_id`, `${USERS_TABLE}.id`)
    .where(`${USERS_TABLE}.id`, userId)
    .select(
      `${USERS_TABLE}.id`,
      `${USERS_TABLE}.role`,
      `${USERS_TABLE}.name`,
      `${USERS_TABLE}.email`,
      `${USERS_TABLE}.mobile_number`,
      `${USERS_TABLE}.created_at`,
      `${USERS_TABLE}.updated_at`,
      `${OFFICE_TABLE}.city`,
      `${OFFICE_TABLE}.agency_company_name as company_name`
    )
    .first();
}

module.exports = { findProfileByUserId };
