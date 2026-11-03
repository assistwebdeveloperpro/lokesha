const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const { SQFT_PER_UNIT } = require("../../modules/shared/property/constants/property.constants");

const PROPERTIES = [
  ...require("./data/dummy-properties/residential.properties"),
  ...require("./data/dummy-properties/commercial.properties"),
  ...require("./data/dummy-properties/pg.properties"),
  ...require("./data/dummy-properties/plot-land.properties"),
];

const BACKEND_ROOT = path.resolve(__dirname, "../../..");
const IMAGE_SOURCE_DIR = path.join(__dirname, "assets", "property-images");
const PROPERTIES_UPLOAD_DIR = path.join(BACKEND_ROOT, "uploads", "properties");
const PUBLIC_PREFIX = "/uploads/properties";
const IMAGE_EXTENSION = ".jpg";
const IMAGE_MIME_TYPE = "image/jpeg";

const LISTING_GAP_MS = 6 * 60 * 60 * 1000;
const STATUS_STEP_MS = 5 * 60 * 1000;

const TYPE_TABLES = {
  residential: "residential_properties",
  commercial: "commercial_properties",
  pg: "pg_properties",
  plot: "plot_properties",
  land: "land_properties",
};

const STATUS_FLOW = {
  draft: ["draft"],
  pending: ["draft", "pending"],
  published: ["draft", "pending", "published"],
};

// The amenity mapping table uses the form id for PG
const toFormPropertyType = (propertyType) => (propertyType === "pg" ? "pg-co-living" : propertyType);

const round2 = (value) => Math.round(value * 100) / 100;

function toSqft(value, unit = "sq-ft") {
  if (value === undefined || value === null) return null;
  return round2(value * (SQFT_PER_UNIT[unit] ?? 1));
}

function smallest(values) {
  const present = values.filter((value) => value !== undefined && value !== null);
  return present.length ? Math.min(...present) : null;
}

function deriveAreaSqft({ variants, plotDetails = {}, details = {}, propertyType }) {
  if (variants?.length) return smallest(variants.map((variant) => toSqft(variant.size, variant.size_unit)));

  const plotArea = toSqft(plotDetails.plot_area, plotDetails.plot_area_unit);
  if (propertyType === "plot" || propertyType === "land") return plotArea;

  return (
    toSqft(details.carpet_area, details.carpet_area_unit) ??
    toSqft(details.super_built_up_area, details.super_built_up_area_unit) ??
    plotArea
  );
}

function derivePrice({ variants, listingType, pricing }) {
  if (variants?.length) return smallest(variants.map((variant) => variant.price));
  return (listingType === "sale" ? pricing.expected_price : pricing.monthly_rent) ?? null;
}

function groupUsersByRole(users) {
  return users.reduce((groups, user) => {
    (groups[user.role] ??= []).push(user);
    return groups;
  }, {});
}

async function loadContext(knex) {
  const [users, admin, subTypes, options, amenityRules] = await Promise.all([
    knex("users").select("id", "role").orderBy("created_at"),
    knex("admins").first("id"),
    knex("property_sub_types").select("id", "property_type", "slug", "name"),
    knex("property_options").select("id", "option_group", "option_key"),
    knex("amenities as a")
      .join("amenity_property_types as apt", "apt.amenity_id", "a.id")
      .where("a.is_active", true)
      .select("a.kind", "a.amenity_key", "apt.listing_type", "apt.property_type", "apt.property_sub_type"),
  ]);

  return {
    usersByRole: groupUsersByRole(users),
    admin,
    subTypes: new Map(subTypes.map((row) => [`${row.property_type}:${row.slug}`, row])),
    optionIds: new Map(options.map((row) => [`${row.option_group}:${row.option_key}`, row.id])),
    amenityRules,
  };
}

function resolveOwner(usersByRole, { role, index = 0 }) {
  return usersByRole[role]?.[index] ?? null;
}

function findAllowedAmenityKeys(amenityRules, { kind, listingType, propertyType, subType }) {
  return new Set(
    amenityRules
      .filter(
        (rule) =>
          rule.kind === kind &&
          rule.listing_type === listingType &&
          rule.property_type === toFormPropertyType(propertyType) &&
          (rule.property_sub_type === null || rule.property_sub_type === subType)
      )
      .map((rule) => rule.amenity_key)
  );
}

async function copyImage(propertyId, kind, sourceName) {
  const fileName = `${kind}-${crypto.randomUUID()}${IMAGE_EXTENSION}`;
  const source = path.join(IMAGE_SOURCE_DIR, `${sourceName}${IMAGE_EXTENSION}`);
  const target = path.join(PROPERTIES_UPLOAD_DIR, propertyId, fileName);

  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(source, target);
  const { size } = await fs.stat(target);

  return {
    file_path: `${PUBLIC_PREFIX}/${propertyId}/${fileName}`,
    original_name: `${sourceName}${IMAGE_EXTENSION}`,
    mime_type: IMAGE_MIME_TYPE,
    file_size: size,
  };
}

async function buildMediaRows(propertyId, images) {
  const files = [];
  for (const [index, [sourceName, category]] of images.entries()) {
    const file = await copyImage(propertyId, "media", sourceName);
    files.push({ property_id: propertyId, category, media_type: "image", sort_order: index, ...file });
  }
  return files;
}

async function buildFloorPlanRows(propertyId, floorPlans) {
  const files = [];
  for (const [index, [sourceName, label, planType]] of floorPlans.entries()) {
    const file = await copyImage(propertyId, "floor-plan", sourceName);
    files.push({ property_id: propertyId, label, plan_type: planType, sort_order: index, ...file });
  }
  return files;
}

function buildStatusHistory({ propertyId, status, user, admin, createdAt }) {
  const steps = STATUS_FLOW[status];

  return steps.map((toStatus, index) => ({
    property_id: propertyId,
    from_status: index === 0 ? null : steps[index - 1],
    to_status: toStatus,
    changed_by_user_id: toStatus === "published" ? null : user.id,
    changed_by_admin_id: toStatus === "published" ? (admin?.id ?? null) : null,
    created_at: new Date(createdAt.getTime() + index * STATUS_STEP_MS),
  }));
}

const insertRows = async (trx, table, rows) => {
  if (rows.length) await trx(table).insert(rows);
};

async function insertBuilderProject(trx, user, project) {
  const { highlights, primeLocations, faqs, ...columns } = project;
  const projectId = crypto.randomUUID();

  await trx("builder_projects").insert({ id: projectId, user_id: user.id, ...columns });
  await insertRows(trx, "builder_highlights", [
    ...highlights.map((item, index) => ({
      builder_project_id: projectId,
      kind: "project-highlight",
      text: item.text,
      sort_order: index,
    })),
    ...primeLocations.map((item, index) => ({
      builder_project_id: projectId,
      kind: "prime-location",
      text: item.text,
      distance: item.distance ?? null,
      sort_order: index,
    })),
  ]);
  await insertRows(
    trx,
    "builder_faqs",
    faqs.map((item, index) => ({
      builder_project_id: projectId,
      question: item.question,
      answer: item.answer,
      sort_order: index,
    }))
  );

  return projectId;
}

function getSubType(context, entry) {
  const subType = context.subTypes.get(`${entry.propertyType}:${entry.subType}`);
  if (!subType) {
    throw new Error(`Property sub type ${entry.propertyType}/${entry.subType} not found, run the base seeds first`);
  }
  return subType;
}

async function insertSelections(trx, context, propertyId, selections) {
  const rows = Object.entries(selections).flatMap(([group, keys]) =>
    keys.map((key) => {
      const optionId = context.optionIds.get(`${group}:${key}`);
      if (!optionId) throw new Error(`Property option ${group}:${key} not found, run the base seeds first`);
      return { property_id: propertyId, option_id: optionId };
    })
  );
  await insertRows(trx, "property_selections", rows);
}

async function insertAmenities(trx, context, propertyId, entry) {
  const kinds = [
    ["amenity", entry.amenities],
    ["furnishing", entry.furnishing],
  ];

  const rows = kinds.flatMap(([kind, keys]) => {
    const allowed = findAllowedAmenityKeys(context.amenityRules, { kind, ...entry });
    return keys
      .filter((key) => allowed.has(key))
      .map((key) => ({ property_id: propertyId, kind, amenity_key: key }));
  });
  await insertRows(trx, "property_amenities", rows);
}

async function insertVariants(trx, { propertyId, entry, subType }) {
  const variants = entry.variants.map((variant) => ({ ...variant, id: crypto.randomUUID() }));

  await insertRows(
    trx,
    "property_variants",
    variants.map(({ id, label, size, size_unit, price, units_available }, index) => ({
      id,
      property_id: propertyId,
      property_type: entry.propertyType,
      property_sub_type_id: subType.id,
      label,
      size,
      size_unit,
      price,
      units_available,
      sort_order: index,
    }))
  );
  await insertRows(
    trx,
    "residential_property_variants",
    variants.map(({ id, details }) => ({ variant_id: id, ...details }))
  );
  await insertRows(
    trx,
    "property_variant_charges",
    variants.map(({ id, charges }) => ({ variant_id: id, ...charges }))
  );

  const prices = variants.map((variant) => variant.price);
  await trx("builder_listing_details").insert({
    property_id: propertyId,
    ...entry.builder.listing,
    price_min: Math.min(...prices),
    price_max: Math.max(...prices),
  });
  await insertRows(
    trx,
    "builder_specifications",
    entry.builder.specifications.map((item, index) => ({
      property_id: propertyId,
      group_title: item.group_title,
      label: item.label,
      value: item.value,
      is_custom: false,
      sort_order: index,
    }))
  );
}

async function insertPropertyGraph(trx, context, { entry, user, propertyId, createdAt }) {
  const subType = getSubType(context, entry);
  const projectId = entry.project ? await insertBuilderProject(trx, user, entry.project) : null;
  const historyRows = buildStatusHistory({
    propertyId,
    status: entry.status,
    user,
    admin: context.admin,
    createdAt,
  });
  const lastChangeAt = historyRows[historyRows.length - 1].created_at;

  await trx("properties").insert({
    id: propertyId,
    user_id: user.id,
    listed_by: user.role,
    listing_type: entry.listingType,
    property_type: entry.propertyType,
    property_sub_type_id: subType.id,
    builder_project_id: projectId,
    status: entry.status,
    title: entry.title,
    price: derivePrice(entry),
    area_sqft: deriveAreaSqft(entry),
    ...entry.property,
    created_at: createdAt,
    updated_at: lastChangeAt,
    published_at: entry.status === "published" ? lastChangeAt : null,
  });

  await trx(TYPE_TABLES[entry.propertyType]).insert({ property_id: propertyId, ...entry.details });
  if (entry.plotDetails) {
    await trx("property_plot_details").insert({ property_id: propertyId, ...entry.plotDetails });
  }

  const pricingTable = entry.listingType === "sale" ? "property_sale_details" : "property_rent_details";
  await trx(pricingTable).insert({ property_id: propertyId, ...entry.pricing });

  await insertSelections(trx, context, propertyId, entry.selections);
  await insertAmenities(trx, context, propertyId, entry);
  if (entry.variants) await insertVariants(trx, { propertyId, entry, subType });

  await insertRows(trx, "property_media", await buildMediaRows(propertyId, entry.images));
  await insertRows(trx, "property_floor_plans", await buildFloorPlanRows(propertyId, entry.floorPlans));
  await insertRows(trx, "property_status_history", historyRows);
}

async function seedProperty(knex, context, entry, index) {
  const user = resolveOwner(context.usersByRole, entry.owner);
  if (!user) {
    console.warn(`Skipped "${entry.title}": no ${entry.owner.role} user found`);
    return "skipped";
  }

  const existing = await knex("properties")
    .where({ title: entry.title, locality: entry.property.locality, listing_type: entry.listingType })
    .first("id");
  if (existing) return "existing";

  const propertyId = crypto.randomUUID();
  const createdAt = new Date(Date.now() - (PROPERTIES.length - index) * LISTING_GAP_MS);

  try {
    await knex.transaction((trx) => insertPropertyGraph(trx, context, { entry, user, propertyId, createdAt }));
  } catch (error) {
    await fs.rm(path.join(PROPERTIES_UPLOAD_DIR, propertyId), { recursive: true, force: true });
    throw error;
  }
  return "created";
}

/** @param {import('knex').Knex} knex */
exports.seed = async function seed(knex) {
  const context = await loadContext(knex);
  const counts = { created: 0, existing: 0, skipped: 0 };

  for (const [index, entry] of PROPERTIES.entries()) {
    counts[await seedProperty(knex, context, entry, index)] += 1;
  }

  console.log(
    `Dummy properties: ${counts.created} created, ${counts.existing} already present, ${counts.skipped} skipped`
  );
};
