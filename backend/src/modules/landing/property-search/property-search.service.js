const repository = require("./property-search.repository");
const mapper = require("./property-search.mapper");
const { searchQuerySchema } = require("./property-search.validation");
const { normalizeText } = require("./property-search.filters");
const { SIMILAR_LIMIT, OTHER_LOCALITIES_LIMIT } = require("./property-search.constants");
const readRepository = require("../../shared/property/repositories/property-read.repository");
const { getRule } = require("../../shared/property/constants/property.constants");
const { AppError } = require("../../shared/property/utils/property.errors");


const buildFilters = (values) => searchQuerySchema.validate(values).value;

async function toListings(rows) {
  const extras = await repository.findCardExtras(rows.flatMap((row) => row.member_ids));
  return rows.map((row) => mapper.toListing(row, extras));
}


async function findOtherLocalityListings(filters) {
  const relaxed = buildFilters({ listingType: filters.listingType, category: filters.category, city: filters.city });
  const rows = await repository.findListings(relaxed, {
    limit: OTHER_LOCALITIES_LIMIT,
    offset: 0,
    excludeLocalities: filters.localities.map(normalizeText),
  });

  return toListings(rows);
}

async function searchProperties(filters) {
  const { page, pageSize } = filters;
  const [total, rows] = await Promise.all([
    repository.countListings(filters),
    repository.findListings(filters, { limit: pageSize, offset: (page - 1) * pageSize }),
  ]);

  return {
    items: await toListings(rows),
    page,
    pageSize,
    total,
    otherLocalities: total === 0 && filters.city ? await findOtherLocalityListings(filters) : [],
  };
}

async function findSimilarListings(property, card) {
  const similar = buildFilters({
    listingType: property.listing_type,
    category: mapper.FORM_TYPE_BY_DB_TYPE[property.property_type],
    subTypes: property.sub_type_slug,
    ...(property.city && { city: property.city }),
  });
  const rows = await repository.findListings(similar, { limit: SIMILAR_LIMIT, offset: 0, excludeIds: card.member_ids });

  return toListings(rows);
}

async function getPropertyDetails(id) {
  const property = await repository.findPublishedProperty(id);
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  const rule = getRule(mapper.FORM_TYPE_BY_DB_TYPE[property.property_type], property.sub_type_slug);
  const isSale = property.listing_type === "sale";
  const isBuilderListing = Boolean(property.builder_project_id);

  const [cardRow, typeRow, plotDetails, pricingRow, builderListing, specifications, selections, amenities, variants, media, floorPlans, project] =
    await Promise.all([
      repository.findCard(property),
      readRepository.findTypeRow(rule.typeTable, id),
      rule.plotDetails ? readRepository.findPlotDetails(id) : null,
      isSale ? readRepository.findSaleDetails(id) : readRepository.findRentDetails(id),
      isBuilderListing ? readRepository.findBuilderListingDetails(id) : null,
      isBuilderListing ? readRepository.findSpecifications(id) : [],
      readRepository.findSelections(id),
      readRepository.findAmenities(id),
      isBuilderListing ? readRepository.findVariants(id, rule.typeTable) : [],
      readRepository.findMedia(id),
      readRepository.findFloorPlans(id),
      isBuilderListing ? readRepository.findProject(property.builder_project_id) : null,
    ]);

  const [[listing], amenityNames, similar, developerStats] = await Promise.all([
    toListings([cardRow]),
    repository.findAmenityNames(amenities.map(({ amenity_key: key }) => key)),
    findSimilarListings(property, cardRow),
    project ? repository.countDeveloperProjects(project) : null,
  ]);

  return {
    ...mapper.toPropertyDetails({
      property,
      listing,
      project,
      developerStats,
      media,
      amenities,
      amenityNames,
      typeRow,
      plotDetails,
      pricingRow,
      builderListing,
      specifications,
      selections,
      variants,
      floorPlans,
    }),
    similar,
  };
}

module.exports = { searchProperties, getPropertyDetails };