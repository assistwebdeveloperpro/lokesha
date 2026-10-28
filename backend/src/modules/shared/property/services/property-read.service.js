const readRepository = require("../repositories/property-read.repository");
const mapper = require("../mappers/property.mapper");
const { PROPERTY_TYPE_TO_DB, getRule } = require("../constants/property.constants");
const { AppError } = require("../utils/property.errors");

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

async function getPropertyForAdmin(propertyId) {
  const property = await readRepository.findOwnedProperty(propertyId);
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  const detail = await buildPropertyDetail(property, property.listed_by);
  return { ...detail, source: property.admin_id ? "admin" : "user" };
}

module.exports = { listAmenityOptions, getPropertyForAdmin, buildPropertyDetail };
