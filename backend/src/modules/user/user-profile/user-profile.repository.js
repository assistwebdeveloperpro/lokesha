const { db } = require("../../../config/db");

const USERS_TABLE = "users";
const OFFICE_TABLE = "user_office_details";
const BUSINESS_TABLE = "user_business_details";

async function findProfileByUserId(userId) {
  return db(USERS_TABLE)
    .leftJoin(OFFICE_TABLE, `${OFFICE_TABLE}.user_id`, `${USERS_TABLE}.id`)
    .leftJoin(BUSINESS_TABLE, `${BUSINESS_TABLE}.user_id`, `${USERS_TABLE}.id`)
    .where(`${USERS_TABLE}.id`, userId)
    .select(
      `${USERS_TABLE}.id`,
      `${USERS_TABLE}.role`,
      `${USERS_TABLE}.name`,
      `${USERS_TABLE}.email`,
      `${USERS_TABLE}.mobile_number`,
      `${USERS_TABLE}.mobile_country_code`,
      `${USERS_TABLE}.alternate_email`,
      `${USERS_TABLE}.receive_on_alternate_email`,
      `${USERS_TABLE}.receive_sms_on_mobile`,
      `${USERS_TABLE}.display_country_code`,
      `${USERS_TABLE}.display_number`,
      `${USERS_TABLE}.is_primary_mobile_virtual`,
      `${USERS_TABLE}.hide_contact_details`,
      `${USERS_TABLE}.agreed_to_terms`,
      `${USERS_TABLE}.whatsapp_number`,
      `${USERS_TABLE}.created_at`,
      `${USERS_TABLE}.updated_at`,
      `${OFFICE_TABLE}.city`,
      `${OFFICE_TABLE}.agency_company_name as company_name`,
      `${OFFICE_TABLE}.contact_person_photo`,
      `${BUSINESS_TABLE}.company_logo`
    )
    .first();
}

async function findUserByMobileNumber(mobileNumber, excludeUserId) {
  return db(USERS_TABLE)
    .where({ mobile_number: mobileNumber })
    .whereNot({ id: excludeUserId })
    .first();
}

async function updateLoginDetails(userId, data) {
  const [user] = await db(USERS_TABLE)
    .where({ id: userId })
    .update({ ...data, updated_at: db.fn.now() })
    .returning("*");
  return user;
}

async function updateWhatsappNumber(userId, whatsappNumber) {
  const [user] = await db(USERS_TABLE)
    .where({ id: userId })
    .update({ whatsapp_number: whatsappNumber, updated_at: db.fn.now() })
    .returning("*");
  return user;
}

module.exports = {
  findProfileByUserId,
  findUserByMobileNumber,
  updateLoginDetails,
  updateWhatsappNumber,
};
