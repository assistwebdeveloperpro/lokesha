const { db } = require("../../../../config/db");

async function findOwnedProperty(id, userId) {
  return db("properties as p")
    .join("property_sub_types as st", "st.id", "p.property_sub_type_id")
    .where({ "p.id": id, "p.user_id": userId })
    .first("p.*", "st.slug as sub_type_slug");
}

module.exports = { findOwnedProperty };
