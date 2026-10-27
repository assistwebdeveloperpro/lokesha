const manageRepository = require("./manage-properties.repository");
const readRepository = require("../../../landing/property/property-read.repository");
const mapper = require("../../../landing/property/property.mapper");
const { PROPERTY_TYPE_TO_DB } = require("../../../landing/property/property.constants");

const toListedBy = (row) => ({
  source: row.admin_id ? "admin" : "user",
  role: row.listed_by,
  name: row.admin_id ? row.admin_name : row.user_name,
});

async function listProperties(query) {
  const filters = {
    ...query,
    propertyType: query.propertyType ? PROPERTY_TYPE_TO_DB[query.propertyType] : undefined,
  };

  const [rows, total] = await Promise.all([
    manageRepository.findListings(filters),
    manageRepository.countListings(filters),
  ]);
  const images = await readRepository.findImagesByPropertyIds(rows.flatMap((row) => row.member_ids));
  const imagesByProperty = mapper.groupBy(images, "property_id");

  return {
    items: rows.map((row) => ({
      ...mapper.toListItem(row, mapper.collectRowImages(row, imagesByProperty)),
      listedBy: toListedBy(row),
    })),
    page: query.page,
    limit: query.limit,
    total,
  };
}

module.exports = { listProperties };
