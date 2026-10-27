const Joi = require("joi");
const f = require("./property-payload.fields");
const { OPTION_GROUPS, PROPERTY_TYPE_TO_DB, POSTING_AS_ROLES, getRule } = require("./property.constants");

const FORM_TYPE_BY_DB_TYPE = Object.fromEntries(
  Object.entries(PROPERTY_TYPE_TO_DB).map(([formType, dbType]) => [dbType, formType])
);
const SELECTION_KEY_BY_GROUP = Object.fromEntries(
  Object.entries(OPTION_GROUPS).map(([key, group]) => [group, key])
);

const HEADER_FIELDS = { facing: Joi.string(), availableFrom: f.date };
const CONSTRUCTION_FIELDS = { possessionDate: f.date };
const SPECIFICATION_FIELDS = {
  groupTitle: Joi.string(),
  label: Joi.string(),
  value: Joi.string(),
  isCustom: Joi.boolean(),
};

const BROCHURE_CATEGORY = "brochure";

function pickMainImage(images = []) {
  const main = images.find(({ category }) => category === "main-photo") ?? images[0];
  return main?.file_path ?? null;
}

const toNumberOrNull = (value) => (value === null || value === undefined ? null : Number(value));

// Rows are one posted property; a post with several sub types arrives as arrays of them
function toListItem(row, images) {
  const slugs = row.sub_type_slugs ?? [row.sub_type_slug];
  const names = row.sub_type_names ?? [row.sub_type_name];
  const subTypes = slugs.map((slug, index) => ({ slug, name: names[index] }));
  const priceMin = toNumberOrNull(row.price_min ?? row.price);

  return {
    id: row.id,
    listingNumber: Number(row.listing_number),
    title: row.title,
    projectName: row.project_name ?? null,
    price: priceMin,
    priceMin,
    priceMax: toNumberOrNull(row.price_max ?? row.price),
    status: row.status,
    listingType: row.listing_type,
    propertyType: FORM_TYPE_BY_DB_TYPE[row.property_type],
    subType: subTypes[0],
    subTypes,
    city: row.city,
    mainImage: pickMainImage(images),
    createdAt: row.created_at,
  };
}

function groupBy(rows, key) {
  return rows.reduce((groups, row) => {
    (groups[row[key]] ??= []).push(row);
    return groups;
  }, {});
}

// Images of every sub type of the row, so the card still has a photo when only a later one has any
const collectRowImages = (row, imagesByProperty) =>
  (row.member_ids ?? [row.id]).flatMap((id) => imagesByProperty[id] ?? []);

const toMediaDto = (row) => ({
  id: row.id,
  path: row.file_path,
  category: row.category,
  mediaType: row.media_type,
  originalName: row.original_name,
  mimeType: row.mime_type,
  size: row.file_size,
});

const toFloorPlanDto = (row) => ({
  id: row.id,
  path: row.file_path,
  label: row.label,
  planType: row.plan_type,
  originalName: row.original_name,
  mimeType: row.mime_type,
  size: row.file_size,
});

function toFilesPayload(media, floorPlans) {
  const brochure = media.find(({ category }) => category === BROCHURE_CATEGORY);

  return {
    media: media
      .filter(({ category }) => category !== BROCHURE_CATEGORY)
      .map(({ path, category, originalName }) => ({ path, category, originalName: originalName ?? undefined })),
    floorPlans: floorPlans.map(({ path, label, planType, originalName }) => ({
      path,
      label: label ?? undefined,
      planType,
      originalName: originalName ?? undefined,
    })),
    ...(brochure && { brochure: { path: brochure.path, originalName: brochure.originalName ?? undefined } }),
  };
}

function toProjectPayload(project) {
  const highlights = project.highlights;

  return {
    ...f.fromRow(project, f.PROJECT),
    highlights: highlights
      .filter(({ kind }) => kind === "project-highlight")
      .map(({ text }) => ({ text })),
    primeLocations: highlights
      .filter(({ kind }) => kind === "prime-location")
      .map(({ text, distance }) => ({ text, ...(distance && { distance }) })),
    faqs: project.faqs.map(({ question, answer }) => ({ question, answer })),
  };
}

function toSelectionsPayload(rows) {
  const groups = groupBy(rows, "option_group");

  return Object.fromEntries(
    Object.entries(groups).map(([group, items]) => [
      SELECTION_KEY_BY_GROUP[group],
      items.map(({ option_key: optionKey }) => optionKey),
    ])
  );
}

function toAmenitiesPayload(rows) {
  const keysOfKind = (kind) => rows.filter((row) => row.kind === kind).map(({ amenity_key: key }) => key);
  return { amenities: keysOfKind("amenity"), furnishing: keysOfKind("furnishing") };
}

function toVariantPayload(variant, typeTable) {
  return {
    ...f.fromRow(variant, f.VARIANT),
    details: f.fromRow(variant.typeRow, f.VARIANT_TYPE[typeTable] ?? {}),
    ...(variant.charges && { charges: f.fromRow(variant.charges, f.VARIANT_CHARGES) }),
  };
}

// Same shape as the complete / update request, so the edit form can load it directly
function toPropertyDetail(data) {
  const { property, typeRow, plotDetails, saleDetails, rentDetails, builderListing } = data;
  const propertyType = FORM_TYPE_BY_DB_TYPE[property.property_type];
  const rule = getRule(propertyType, property.sub_type_slug);
  const media = data.media.map(toMediaDto);
  const floorPlans = data.floorPlans.map(toFloorPlanDto);
  const isBuilderListing = Boolean(data.project);
  const isSale = property.listing_type === "sale";

  const listing = {
    propertySubType: property.sub_type_slug,
    description: property.description,
    ...f.fromRow(property, HEADER_FIELDS),
    construction: {
      ...(property.construction_status && { status: property.construction_status }),
      ...f.fromRow(property, CONSTRUCTION_FIELDS),
    },
    details: f.fromRow(typeRow, f.TYPE_FIELDS[rule.typeTable]),
    pricing: isSale ? f.fromRow(saleDetails, f.SALE) : f.fromRow(rentDetails, f.RENT),
    selections: toSelectionsPayload(data.selections),
    amenities: toAmenitiesPayload(data.amenities),
    files: toFilesPayload(media, floorPlans),
    ...(rule.plotDetails && { plotDetails: f.fromRow(plotDetails, f.PLOT_DETAILS) }),
    ...(isBuilderListing && {
      variants: data.variants.map((variant) => toVariantPayload(variant, rule.typeTable)),
      builder: {
        listing: f.fromRow(builderListing, f.BUILDER_LISTING),
        specifications: data.specifications.map((row) => f.fromRow(row, SPECIFICATION_FIELDS)),
      },
    }),
  };

  return {
    property: {
      id: property.id,
      listingNumber: Number(property.listing_number),
      status: property.status,
      title: property.title,
      price: property.price === null ? null : Number(property.price),
      rejectionReason: property.status === "rejected" ? data.rejectionReason : null,
      createdAt: property.created_at,
      updatedAt: property.updated_at,
      publishedAt: property.published_at,
    },
    payload: {
      listingType: property.listing_type,
      propertyType,
      ...(isBuilderListing && POSTING_AS_ROLES.includes(data.role) && { postingAs: "builder" }),
      address: f.fromRow(property, f.ADDRESS),
      ...(isBuilderListing && { project: toProjectPayload(data.project) }),
      listings: [listing],
    },
    media,
    floorPlans,
  };
}

module.exports = {
  pickMainImage,
  toListItem,
  toPropertyDetail,
  toMediaDto,
  toFloorPlanDto,
  groupBy,
  collectRowImages,
};
