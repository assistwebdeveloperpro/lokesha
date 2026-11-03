const { db } = require("../../../config/db");

async function createRequirement(userId, data) {
  const [row] = await db("property_requirements")
    .insert({
      user_id: userId,
      listing_type: data.listingType,
      property_type: data.propertyType,
      city: data.city,
      localities: data.localities,
      sub_types: data.subTypes,
      requirement: data.requirement,
    })
    .returning(["id", "created_at"]);

  return row;
}

module.exports = { createRequirement };
