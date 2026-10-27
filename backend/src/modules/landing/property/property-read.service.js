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

  const images = await readRepository.findImagesByPropertyIds(rows.flatMap((row) => row.member_ids));
  const imagesByProperty = mapper.groupBy(images, "property_id");

  const rejectedRows = rows.filter((row) => row.status === "rejected");
  const reasons = rejectedRows.length
    ? await readRepository.findRejectionReasons(rejectedRows.flatMap((row) => row.member_ids))
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

// ownerRole decides how the listing was posted, so it is the owner's role, not the viewer's
async function buildSingleDetail(property, ownerRole) {
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

// A post with several sub types opens as one property: a listing and its own files per sub type
async function buildPropertyDetail(property, ownerRole) {
  const siblings = (await readRepository.findGroupSiblings(property)) ?? [];
  const members = [property, ...siblings].sort((a, b) => Number(a.listing_number) - Number(b.listing_number));
  const details = await Promise.all(members.map((member) => buildSingleDetail(member, ownerRole)));
  const opened = details.find((detail) => detail.property.id === property.id);

  return {
    ...opened,
    payload: {
      ...opened.payload,
      listings: details.map((detail) => ({ ...detail.payload.listings[0], propertyId: detail.property.id })),
    },
    listingFiles: details.map(({ property: { id }, media, floorPlans }) => ({ propertyId: id, media, floorPlans })),
  };
}

async function getMyProperty(user, propertyId) {
  const property = await readRepository.findOwnedProperty(propertyId, user.id);
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  return buildPropertyDetail(property, user.role);
}

async function getPropertyForAdmin(propertyId) {
  const property = await readRepository.findOwnedProperty(propertyId);
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  const detail = await buildPropertyDetail(property, property.listed_by);
  return { ...detail, source: property.admin_id ? "admin" : "user" };
}

module.exports = { listAmenityOptions, listMyProperties, getMyProperty, getPropertyForAdmin, buildPropertyDetail };
