const manageRepository = require("./manage-properties.repository");
const readRepository = require("../../../shared/property/repositories/property-read.repository");
const mapper = require("../../../shared/property/mappers/property.mapper");
const propertyService = require("../../../shared/property/services/property.service");
const { PROPERTY_TYPE_TO_DB } = require("../../../shared/property/constants/property.constants");

async function listMyProperties(user, query) {
  const filters = {
    ...query,
    propertyType: query.propertyType ? PROPERTY_TYPE_TO_DB[query.propertyType] : undefined,
  };

  const [rows, total] = await Promise.all([
    manageRepository.findListingsByUser(user.id, filters),
    manageRepository.countListingsByUser(user.id, filters),
  ]);

  const images = await readRepository.findImagesByPropertyIds(rows.flatMap((row) => row.member_ids));
  const imagesByProperty = mapper.groupBy(images, "property_id");

  const rejectedRows = rows.filter((row) => row.status === "rejected");
  const reasons = rejectedRows.length
    ? await manageRepository.findRejectionReasons(rejectedRows.flatMap((row) => row.member_ids))
    : [];
  const reasonByProperty = new Map(reasons.map((row) => [row.property_id, row.reason]));
  const findReason = (row) => row.member_ids.map((id) => reasonByProperty.get(id)).find(Boolean) ?? null;

  return {
    items: rows.map((row) => ({
      ...mapper.toListItem(row, mapper.collectRowImages(row, imagesByProperty)),
      rejectionReason: findReason(row),
    })),
    page: query.page,
    limit: query.limit,
    total,
  };
}

module.exports = {
  listMyProperties,
  submitProperty: propertyService.submitProperty,
  closeProperty: propertyService.closeProperty,
  deleteProperty: propertyService.deleteProperty,
};
