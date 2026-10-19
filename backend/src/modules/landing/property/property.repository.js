const { db } = require("../../../config/db");

const PROPERTIES = "properties";
const AMENITIES = "property_amenities";
const MEDIA = "property_media";

const SUMMARY_COLUMNS = [
  "p.id",
  "p.status",
  "p.listing_type",
  "p.property_type",
  "p.property_sub_type",
  "p.project_name",
  "p.locality",
  "p.city",
  "p.state",
  "p.carpet_area",
  "p.carpet_area_unit",
  "p.bedrooms",
  "p.bathrooms",
  "p.expected_price",
  "p.monthly_rent",
  "p.created_at",
];

function conn(trx) {
  return trx || db;
}

// Main photo first, otherwise the first image by upload order
function mainImageSubquery(trx) {
  return conn(trx)(`${MEDIA} as m`)
    .select("m.file_path")
    .whereRaw("m.property_id = p.id")
    .andWhere("m.media_type", "image")
    .orderByRaw("(m.category = 'main-photo') DESC")
    .orderBy("m.sort_order", "asc")
    .limit(1)
    .as("main_image");
}

async function createProperty(owner, data, trx) {
  const [property] = await conn(trx)(PROPERTIES)
    .insert({ ...owner, ...data })
    .returning("*");
  return property;
}

async function updateProperty(id, userId, data, trx) {
  const [property] = await conn(trx)(PROPERTIES)
    .where({ id, user_id: userId })
    .update({ ...data, updated_at: db.fn.now() })
    .returning("*");
  return property;
}

async function insertAmenities(propertyId, kind, keys, trx) {
  if (!keys.length) return;

  await conn(trx)(AMENITIES).insert(
    keys.map((key) => ({ property_id: propertyId, kind, amenity_key: key }))
  );
}

async function replaceAmenities(propertyId, amenities, furnishing, trx) {
  await conn(trx)(AMENITIES).where({ property_id: propertyId }).del();
  await insertAmenities(propertyId, "amenity", amenities, trx);
  await insertAmenities(propertyId, "furnishing", furnishing, trx);
}

async function insertMedia(propertyId, mediaRows, trx) {
  if (!mediaRows.length) return [];

  return conn(trx)(MEDIA)
    .insert(mediaRows.map((row) => ({ property_id: propertyId, ...row })))
    .returning("*");
}

async function findByIdForUser(id, userId, trx) {
  return conn(trx)(PROPERTIES).where({ id, user_id: userId }).first();
}

// Published for everyone, any status for the owner
async function findByIdVisibleTo(id, userId) {
  return db(`${PROPERTIES} as p`)
    .leftJoin("users as u", "u.id", "p.user_id")
    .leftJoin("admins as a", "a.id", "p.admin_id")
    .select("p.*", db.raw("COALESCE(u.name, a.name) as owner_name"))
    .where("p.id", id)
    .andWhere((builder) => {
      builder.where("p.status", "published");
      if (userId) builder.orWhere("p.user_id", userId);
    })
    .first();
}

async function findAmenitiesByPropertyId(propertyId, trx) {
  return conn(trx)(AMENITIES)
    .select("kind", "amenity_key")
    .where({ property_id: propertyId })
    .orderBy("created_at", "asc")
    .orderBy("amenity_key", "asc");
}

async function findCatalogAmenities({ listingType, propertyType, propertySubType }) {
  return db("amenities as a")
    .distinct("a.kind", "a.amenity_key", "a.name", "a.image_path", "a.sort_order")
    .join("amenity_property_types as m", "m.amenity_id", "a.id")
    .where("a.is_active", true)
    .andWhere("m.property_type", propertyType)
    .andWhere("m.listing_type", listingType)
    .modify((qb) => {
      if (propertySubType) qb.andWhere("m.property_sub_type", propertySubType);
    })
    .orderBy("a.kind", "asc")
    .orderBy("a.sort_order", "asc");
}

async function findMediaByPropertyId(propertyId, trx) {
  return conn(trx)(MEDIA)
    .where({ property_id: propertyId })
    .orderBy("sort_order", "asc")
    .orderBy("created_at", "asc");
}

async function listProperties(applyFilters, { limit, offset }) {
  const rows = await db(`${PROPERTIES} as p`)
    .select(...SUMMARY_COLUMNS, mainImageSubquery())
    .modify(applyFilters)
    .orderBy("p.created_at", "desc")
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db(`${PROPERTIES} as p`).modify(applyFilters).count({ total: "*" });

  return { rows, total: Number(total) };
}

async function findPublished({ listingType, propertyType, city, limit, offset }) {
  const applyFilters = (builder) => {
    builder.where("p.status", "published");
    if (listingType) builder.andWhere("p.listing_type", listingType);
    if (propertyType) builder.andWhere("p.property_type", propertyType);
    if (city) builder.andWhereRaw("LOWER(p.city) = LOWER(?)", [city]);
  };

  return listProperties(applyFilters, { limit, offset });
}

async function findAllByUser(userId, { status, limit, offset }) {
  const applyFilters = (builder) => {
    builder.where("p.user_id", userId);
    if (status) builder.andWhere("p.status", status);
  };

  return listProperties(applyFilters, { limit, offset });
}

async function countMedia(propertyId, trx) {
  const [{ total }] = await conn(trx)(MEDIA).where({ property_id: propertyId }).count({ total: "*" });
  return Number(total);
}

async function findNextSortOrder(propertyId, trx) {
  const [{ max }] = await conn(trx)(MEDIA).where({ property_id: propertyId }).max({ max: "sort_order" });
  return max === null ? 0 : Number(max) + 1;
}

async function findMediaByIdForProperty(mediaId, propertyId, trx) {
  return conn(trx)(MEDIA).where({ id: mediaId, property_id: propertyId }).first();
}

async function deleteMedia(mediaId, trx) {
  await conn(trx)(MEDIA).where({ id: mediaId }).del();
}

async function updateBrochurePath(id, brochurePath, trx) {
  await conn(trx)(PROPERTIES)
    .where({ id })
    .update({ brochure_path: brochurePath, updated_at: db.fn.now() });
}

async function deleteProperty(id, userId, trx) {
  return conn(trx)(PROPERTIES).where({ id, user_id: userId }).del();
}

module.exports = {
  createProperty,
  updateProperty,
  insertAmenities,
  replaceAmenities,
  insertMedia,
  findByIdForUser,
  findByIdVisibleTo,
  findAmenitiesByPropertyId,
  findCatalogAmenities,
  findMediaByPropertyId,
  findPublished,
  findAllByUser,
  countMedia,
  findNextSortOrder,
  findMediaByIdForProperty,
  deleteMedia,
  updateBrochurePath,
  deleteProperty,
};
