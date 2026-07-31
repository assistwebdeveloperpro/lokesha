const { db } = require("../../../config/db");

const TABLE = "user_office_details";

async function findByUserId(userId) {
  return db(TABLE).where({ user_id: userId }).first();
}

async function upsertOfficeDetails(userId, data) {
  const existing = await db(TABLE).where({ user_id: userId }).first();

  if (existing) {
    const [officeDetail] = await db(TABLE)
      .where({ id: existing.id })
      .update({ ...data, updated_at: db.fn.now() })
      .returning("*");
    return officeDetail;
  }

  const [officeDetail] = await db(TABLE)
    .insert({ user_id: userId, ...data })
    .returning("*");
  return officeDetail;
}

async function updateContactPersonPhoto(userId, contactPersonPhotoPath) {
  const [officeDetail] = await db(TABLE)
    .where({ user_id: userId })
    .update({ contact_person_photo: contactPersonPhotoPath, updated_at: db.fn.now() })
    .returning("*");
  return officeDetail;
}

module.exports = { findByUserId, upsertOfficeDetails, updateContactPersonPhoto };
