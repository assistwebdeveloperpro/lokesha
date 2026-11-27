const repository = require("./popular-projects.repository");
const readRepository = require("../../../shared/property/repositories/property-read.repository");
const mapper = require("../../../shared/property/mappers/property.mapper");
const { PROPERTY_TYPE_TO_DB } = require("../../../shared/property/constants/property.constants");
const { AppError } = require("../../../shared/property/utils/property.errors");
const landingService = require("../../../landing/popular-projects/popular-projects.service");
const searchRepository = require("../../../landing/property-search/property-search.repository");
const searchMapper = require("../../../landing/property-search/property-search.mapper");

const SECTION_NAME = "Popular Projects";

const toNumberOrNull = (value) => (value === null || value === undefined ? null : Number(value));

async function findMainImages(rows) {
  const images = await readRepository.findImagesByPropertyIds(rows.flatMap((row) => row.member_ids ?? []));
  const imagesByProperty = mapper.groupBy(images, "property_id");

  return (row) => mapper.pickMainImage(mapper.collectRowImages({ member_ids: row.member_ids ?? [] }, imagesByProperty));
}

const toProjectDto = (row, mainImage) => ({
  projectId: row.project_id,
  projectName: row.project_name,
  builderName: row.developer_name,
  locality: row.locality,
  city: row.city,
  priceMin: toNumberOrNull(row.price_min),
  priceMax: toNumberOrNull(row.price_max),
  mainImage: mainImage(row),
});

// The fields the public details URL is built from, taken from the same card the landing page uses
async function findDetailsSources(projectIds) {
  const cards = await landingService.findCardsByProject(projectIds);
  const extras = await searchRepository.findCardExtras([...cards.values()].flatMap((card) => card.member_ids));

  return new Map(
    [...cards].map(([projectId, card]) => {
      const listing = searchMapper.toListing(card, extras);
      return [
        projectId,
        {
          id: listing.id,
          bedrooms: listing.bedrooms,
          carpetArea: listing.carpetAreaMin,
          carpetAreaUnit: listing.carpetAreaUnit,
          propertySubType: listing.propertySubType,
          propertyType: listing.propertyType,
          listingType: listing.listingType,
          locality: listing.locality,
          city: listing.city,
        },
      ];
    })
  );
}

async function searchProjects({ page, limit, ...query }) {
  const filters = { ...query, propertyType: query.propertyType ? PROPERTY_TYPE_TO_DB[query.propertyType] : undefined };

  const [rows, total] = await Promise.all([
    repository.findEligibleProjects(filters, { limit, offset: (page - 1) * limit }),
    repository.countEligibleProjects(filters),
  ]);
  const [mainImage, detailsSources] = await Promise.all([
    findMainImages(rows),
    findDetailsSources(rows.map((row) => row.project_id)),
  ]);

  return {
    items: rows.map((row) => ({
      ...toProjectDto(row, mainImage),
      listingNumber: Number(row.listing_number),
      detailsSource: detailsSources.get(row.project_id) ?? null,
      alreadyAdded: row.already_added,
    })),
    page,
    limit,
    total,
  };
}

async function listEntries() {
  const rows = await repository.findEntries();
  const mainImage = await findMainImages(rows);

  return {
    items: rows.map((row, index) => ({
      ...toProjectDto(row, mainImage),
      position: index + 1,
      isVisible: row.is_visible,
    })),
    total: rows.length,
  };
}

async function addProjects(projectIds) {
  const eligibleIds = new Set(await repository.findEligibleProjectIds(projectIds));
  if (projectIds.some((id) => !eligibleIds.has(id))) {
    throw new AppError(`Only published builder projects can be added to ${SECTION_NAME}`, 400);
  }

  const added = await repository.insertEntries(projectIds);
  return { added: added.length, skipped: projectIds.length - added.length };
}

async function removeProject(projectId) {
  const removed = await repository.deleteEntry(projectId);
  if (!removed) {
    throw new AppError(`Project is not in ${SECTION_NAME}`, 404);
  }
}

async function saveOrder(projectIds) {
  const saved = await repository.replaceOrder(projectIds);
  if (!saved) {
    throw new AppError(`${SECTION_NAME} projects changed, refresh and try again`, 409);
  }
}

module.exports = { searchProjects, listEntries, addProjects, removeProject, saveOrder };
