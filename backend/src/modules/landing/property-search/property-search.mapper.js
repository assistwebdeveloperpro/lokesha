const { PROPERTY_TYPE_TO_DB } = require("../../shared/property/constants/property.constants");
const { pickMainImage, toFloorPlanDto } = require("../../shared/property/mappers/property.mapper");
const { POSTED_BY_LABEL } = require("./property-search.constants");

const FORM_TYPE_BY_DB_TYPE = Object.fromEntries(
  Object.entries(PROPERTY_TYPE_TO_DB).map(([formType, dbType]) => [dbType, formType])
);
const CONSTRUCTION_LABELS = {
  "ready-to-move": "Ready to Move",
  "under-construction": "Under Construction",
  "pre-launch": "Pre Launch",
};
const DEFAULT_POSTER_NAME = "Lokesha";
const BROCHURE_CATEGORY = "brochure";
const STAFF_LISTED_BY = new Set(["lokesha_staff", "admin"]);
const HIDDEN_COLUMNS = new Set([
  "property_id",
  "variant_id",
  "property_type",
  "listing_type",
  "user_id",
  "admin_id",
  "created_at",
  "updated_at",
]);

const toNumberOrNull = (value) => (value === null || value === undefined ? null : Number(value));
const toCamelCase = (key) => key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

// Row columns as camelCase, without ids and owner columns
function toCamelRow(row, hidden = HIDDEN_COLUMNS) {
  if (!row) return null;

  return Object.fromEntries(
    Object.entries(row)
      .filter(([key]) => !hidden.has(key))
      .map(([key, value]) => [toCamelCase(key), value])
  );
}

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;

const formatPossession = (value) =>
  value ? new Date(value).toLocaleDateString("en-US", { month: "short", year: "numeric" }).replace(" ", "'") : null;

const SQFT_UNIT = "sq-ft";

// Only a single sale unit has one price and one size to divide
const toPricePerSqft = ({ isBuilder, listingType, price, area, unit }) =>
  !isBuilder && listingType === "sale" && unit === SQFT_UNIT && price && area ? Math.round(price / area) : null;

const uniqueSorted = (values) => [...new Set(values.filter((value) => Number.isFinite(value)))].sort((a, b) => a - b);

const minOrNull = (values) => (values.length ? Math.min(...values) : null);
const maxOrNull = (values) => (values.length ? Math.max(...values) : null);

function resolveCarParkingCount(row, variants, isBuilder) {
  if (!isBuilder) {
    return row.car_parking_count ?? null;
  }

  const counts = variants
    .map(({ car_parking_count: count }) => toNumberOrNull(count))
    .filter((count) => count !== null && count > 0);
  if (counts.length) {
    return maxOrNull(counts);
  }

  if (variants.some(({ car_parking_available: available }) => available)) {
    return row.car_parking_count ?? null;
  }

  return row.car_parking_count ?? null;
}

const trimOrNull = (value) => {
  const trimmed = value?.trim();
  return trimmed || null;
};

const toListerName = (row) =>
  STAFF_LISTED_BY.has(row.listed_by)
    ? trimOrNull(row.owner_contact_name)
    : trimOrNull(row.poster_name);

function buildSubtitle(row, bedrooms) {
  const configuration = bedrooms.length ? `${bedrooms.join(", ")} BHK ` : "";
  const transaction = row.listing_type === "sale" ? "sale" : "rent";
  return `${configuration}${row.sub_type_name} for ${transaction} in ${row.locality}, ${row.city}`;
}

// row is one posted property, extras hold the files and units of all its sub types
function toListing(row, extras) {
  const inGroup = (item) => row.member_ids.includes(item.property_id);
  const media = extras.media.filter(inGroup);
  const variants = extras.variants.filter(inGroup);
  const bedrooms = uniqueSorted([...row.bedrooms, ...variants.map(({ bhk }) => bhk)].map(Number));
  const variantAreas = variants.flatMap((variant) => [variant.carpet_area, variant.carpet_area_max]).map(toNumberOrNull);
  const areas = variantAreas.filter((area) => area !== null);
  const priceMin = toNumberOrNull(row.price_min);
  const isBuilder = Boolean(row.builder_project_id);
  const carpetAreaMin = toNumberOrNull(row.area_min) ?? minOrNull(areas);
  const carpetAreaUnit = row.area_unit ?? SQFT_UNIT;

  return {
    id: row.id,
    title: row.project_name ?? row.society_name ?? row.title,
    subtitle: buildSubtitle(row, bedrooms),
    categoryLabel: bedrooms.length ? `${bedrooms.join(", ")} BHK ${row.sub_type_name}` : row.sub_type_name,
    imageUrl: pickMainImage(media.filter(({ category }) => category !== BROCHURE_CATEGORY)),
    listingType: row.listing_type,
    price: priceMin,
    priceMin,
    priceMax: toNumberOrNull(row.price_max),
    pricePerSqft: toPricePerSqft({
      isBuilder,
      listingType: row.listing_type,
      price: priceMin,
      area: carpetAreaMin,
      unit: carpetAreaUnit,
    }),
    carpetAreaMin,
    carpetAreaMax: toNumberOrNull(row.area_max) ?? maxOrNull(areas),
    carpetAreaUnit,
    bedrooms,
    propertySubType: row.sub_type_slug,
    propertySubTypes: row.sub_type_slugs?.length ? row.sub_type_slugs : [row.sub_type_slug],
    propertyType: FORM_TYPE_BY_DB_TYPE[row.property_type],
    locality: row.locality,
    city: row.city,
    constructionStatus: CONSTRUCTION_LABELS[row.construction_status] ?? null,
    launchDate: formatDate(row.launch_date),
    possessionDate: formatPossession(row.possession_date),
    totalUnits: row.total_units ?? null,
    totalFloors: row.total_floors ?? null,
    floorNumber: row.floor_number ?? null,
    furnishingStatus: row.furnishing_status ?? null,
    ageOfConstruction: row.age_of_construction ?? null,
    propertyTransaction: row.property_transaction ?? null,
    washrooms: row.washrooms ?? null,
    carParkingCount: resolveCarParkingCount(row, variants, isBuilder),
    pgGender: row.pg_gender ?? null,
    foodChargeType: row.food_charge_type ?? null,
    roadFacing: row.road_facing ?? null,
    openSides: row.open_sides ?? null,
    cornerPlot: row.corner_plot ?? null,
    boundaryWallMade: row.boundary_wall_made ?? null,
    anyConstruction: row.any_construction ?? null,
    postedBy: POSTED_BY_LABEL[row.posted_by],
    listerName: toListerName(row),
    reraRegistered: Boolean(row.rera_link) || extras.reraRows.some(inGroup),
    builderName: isBuilder ? row.developer_name ?? row.project_name : null,
    hasBrochure: media.some(({ category }) => category === BROCHURE_CATEGORY),
  };
}

function toPosterName(property, postedBy, developerName) {
  const byRole = {
    owner: property.poster_name,
    dealer: property.poster_agency ?? property.poster_name,
    builder: developerName ?? property.poster_company ?? property.poster_name,
  };
  return byRole[postedBy] ?? DEFAULT_POSTER_NAME;
}

function toAddress(property) {
  return [property.project_name, property.locality, property.city, property.state].filter(Boolean).join(", ");
}

function groupSelections(rows) {
  return rows.reduce((groups, { option_group: group, option_key: key }) => {
    (groups[toCamelCase(group)] ??= []).push(key);
    return groups;
  }, {});
}

function toVariant({ typeRow, charges, ...variant }) {
  return { ...toCamelRow(variant), ...toCamelRow(typeRow), charges: toCamelRow(charges) };
}

function galleryMedia(media) {
  return media.filter(({ category }) => category !== BROCHURE_CATEGORY);
}

const MAIN_PHOTO_CATEGORY = "main-photo";

function uniquePaths(paths) {
  return [...new Set(paths)];
}

function toGalleryImagePaths(media, listingImageUrl) {
  const items = galleryMedia(media);
  const mainPhotoPaths = uniquePaths(
    items.filter(({ category }) => category === MAIN_PHOTO_CATEGORY).map(({ file_path: path }) => path),
  );
  const otherPaths = uniquePaths(
    items
      .filter(({ category }) => category !== MAIN_PHOTO_CATEGORY)
      .map(({ file_path: path }) => path)
      .filter((path) => !mainPhotoPaths.includes(path)),
  );
  let paths = [...mainPhotoPaths, ...otherPaths];

  if (!listingImageUrl) return paths;

  const withoutListingImage = paths.filter((path) => path !== listingImageUrl);
  if (!paths.includes(listingImageUrl)) {
    return [listingImageUrl, ...paths];
  }

  return [listingImageUrl, ...withoutListingImage];
}

function toGalleryImageCategories(media) {
  const groups = new Map();
  const order = [];

  for (const { category, file_path: path } of galleryMedia(media)) {
    const key = category ?? "others";
    if (!groups.has(key)) {
      groups.set(key, []);
      order.push(key);
    }
    groups.get(key).push(path);
  }

  const mainIndex = order.indexOf(MAIN_PHOTO_CATEGORY);
  if (mainIndex > 0) {
    order.splice(mainIndex, 1);
    order.unshift(MAIN_PHOTO_CATEGORY);
  }

  return order.map((category) => ({ category, images: groups.get(category) }));
}

// data is the raw rows of one published property, listing is its card
function toPropertyDetails(data) {
  const { property, listing, project, media, amenityNames } = data;
  const amenityNameOf = (kind) =>
    data.amenities
      .filter((row) => row.kind === kind)
      .map((row) => amenityNames.find((item) => item.kind === kind && item.amenity_key === row.amenity_key))
      .filter(Boolean)
      .map(({ name, image_path: imagePath }) => ({ name, imagePath }));

  return {
    id: property.id,
    displayPropertyId: String(property.listing_number),
    kind: project ? "project" : "unit",
    listing,
    images: toGalleryImagePaths(media, listing.imageUrl),
    imageCategories: toGalleryImageCategories(media),
    address: toAddress(property),
    description: property.description,
    facing: property.facing,
    availableFrom: property.available_from,
    constructionStatus: property.construction_status,
    possessionDate: property.possession_date,
    amenities: amenityNameOf("amenity"),
    furnishingItems: amenityNameOf("furnishing"),
    attributes: { ...toCamelRow(data.typeRow), ...toCamelRow(data.plotDetails) },
    pricing: toCamelRow(data.pricingRow),
    selections: groupSelections(data.selections),
    floorPlans: data.floorPlans.map(toFloorPlanDto),
    brochure: media.find(({ category }) => category === BROCHURE_CATEGORY)?.file_path ?? null,
    poster: {
      name: toPosterName(property, listing.postedBy, project?.developer_name),
      postedBy: listing.postedBy,
    },
    ...(project && {
      project: {
        ...toCamelRow(project, new Set([...HIDDEN_COLUMNS, "highlights", "faqs"])),
        highlights: project.highlights.map(({ kind, text, distance }) => ({ kind, text, distance })),
        faqs: project.faqs.map(({ question, answer }) => ({ question, answer })),
        developerStats: data.developerStats,
      },
      builderListing: toCamelRow(data.builderListing),
      variants: data.variants.map(toVariant),
      specifications: data.specifications.map(({ group_title: group, label, value }) => ({ group, label, value })),
    }),
  };
}

module.exports = { FORM_TYPE_BY_DB_TYPE, toListing, toPropertyDetails };
