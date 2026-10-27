const readRepository = require("./property-read.repository");
const mapper = require("./property.mapper");
const { PROPERTY_TYPE_TO_DB, getRule } = require("./property.constants");
const { AppError } = require("./property.errors");

const DB_TYPE_TO_FORM_TYPE = Object.fromEntries(
  Object.entries(PROPERTY_TYPE_TO_DB).map(([formType, dbType]) => [dbType, formType])
);

const toAmenityOption = (row) => ({ key: row.amenity_key, name: row.name, imagePath: row.image_path });

// What the form offers for a listing type, property type and sub type
async function listAmenityOptions(query) {
  const rows = await readRepository.findAmenityOptions(query);

  return {
    amenities: rows.filter((row) => row.kind === "amenity").map(toAmenityOption),
    furnishing: rows.filter((row) => row.kind === "furnishing").map(toAmenityOption),
  };
}

async function listMyProperties(user, query) {
  const filters = {
    ...query,
    propertyType: query.propertyType ? PROPERTY_TYPE_TO_DB[query.propertyType] : undefined,
  };

  const [rows, total] = await Promise.all([
    readRepository.findListingsByUser(user.id, filters),
    readRepository.countListingsByUser(user.id, filters),
  ]);

  const images = await readRepository.findImagesByPropertyIds(rows.map(({ id }) => id));
  const imagesByProperty = mapper.groupBy(images, "property_id");

  const rejectedIds = rows.filter((row) => row.status === "rejected").map(({ id }) => id);
  const reasons = rejectedIds.length ? await readRepository.findRejectionReasons(rejectedIds) : [];
  const reasonByProperty = new Map(reasons.map((row) => [row.property_id, row.reason]));

  return {
    items: rows.map((row) => ({
      ...mapper.toListItem(row, imagesByProperty[row.id]),
      rejectionReason: reasonByProperty.get(row.id) ?? null,
    })),
    page: query.page,
    limit: query.limit,
    total,
  };
}

// ownerRole decides how the listing was posted, so it is the owner's role, not the viewer's
async function buildPropertyDetail(property, ownerRole) {
  const propertyId = property.id;
  const rule = getRule(DB_TYPE_TO_FORM_TYPE[property.property_type], property.sub_type_slug);
  const isSale = property.listing_type === "sale";
  const isBuilderListing = Boolean(property.builder_project_id);

  const [
    typeRow,
    plotDetails,
    pricingRow,
    builderListing,
    specifications,
    selections,
    amenities,
    variants,
    media,
    floorPlans,
    project,
    rejectionReason,
  ] = await Promise.all([
    readRepository.findTypeRow(rule.typeTable, propertyId),
    rule.plotDetails ? readRepository.findPlotDetails(propertyId) : null,
    isSale ? readRepository.findSaleDetails(propertyId) : readRepository.findRentDetails(propertyId),
    isBuilderListing ? readRepository.findBuilderListingDetails(propertyId) : null,
    isBuilderListing ? readRepository.findSpecifications(propertyId) : [],
    readRepository.findSelections(propertyId),
    readRepository.findAmenities(propertyId),
    isBuilderListing ? readRepository.findVariants(propertyId, rule.typeTable) : [],
    readRepository.findMedia(propertyId),
    readRepository.findFloorPlans(propertyId),
    isBuilderListing ? readRepository.findProject(property.builder_project_id) : null,
    property.status === "rejected" ? readRepository.findLastRejectionReason(propertyId) : null,
  ]);

  return mapper.toPropertyDetail({
    property,
    role: ownerRole,
    typeRow,
    plotDetails,
    saleDetails: isSale ? pricingRow : null,
    rentDetails: isSale ? null : pricingRow,
    builderListing,
    specifications,
    selections,
    amenities,
    variants,
    media,
    floorPlans,
    project,
    rejectionReason,
  });
}

async function getMyProperty(user, propertyId) {
  const property = await readRepository.findOwnedProperty(propertyId, user.id);
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  return buildPropertyDetail(property, user.role);
}

module.exports = { listAmenityOptions, listMyProperties, getMyProperty, buildPropertyDetail };
