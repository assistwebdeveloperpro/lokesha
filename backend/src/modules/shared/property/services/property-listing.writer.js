const crypto = require("crypto");
const writeRepository = require("../repositories/property-write.repository");
const { toRow, toSnakeCase, PROJECT } = require("../validation/property-payload.fields");
const derive = require("../utils/property-derive.util");
const { OPTION_GROUPS, PROPERTY_TYPE_TO_DB, getRule } = require("../constants/property.constants");
const { toOwnerColumns } = require("../utils/property-actor.util");

const AMENITY_KIND_BY_PAYLOAD_KEY = { amenities: "amenity", furnishing: "furnishing" };

// Optional columns are written as null so an edit can clear them
const NULLABLE_PROPERTY_COLUMNS = [
  "project_name",
  "block_no",
  "flat_number",
  "address_line_2",
  "landmark",
  "city",
  "facing",
  "available_from",
  "construction_status",
  "possession_date",
];
const NULLABLE_PROJECT_COLUMNS = Object.keys(PROJECT).map(toSnakeCase);

const nullColumns = (columns) => Object.fromEntries(columns.map((column) => [column, null]));
const hasKeys = (object) => Boolean(object) && Object.keys(object).length > 0;

async function resolveLookups(value, fields) {
  const dbType = PROPERTY_TYPE_TO_DB[value.propertyType];
  const { listingType, propertyType } = value;

  const subTypeRows = await writeRepository.findSubTypes(
    dbType,
    value.listings.map((listing) => listing.propertySubType)
  );
  const subTypes = new Map(subTypeRows.map((row) => [row.slug, row]));

  const groups = [
    ...new Set(
      value.listings.flatMap((listing) => Object.keys(listing.selections).map((key) => OPTION_GROUPS[key]))
    ),
  ];
  const optionRows = groups.length ? await writeRepository.findActiveOptions(groups) : [];
  const optionIds = new Map(optionRows.map((row) => [`${row.option_group}:${row.option_key}`, row.id]));

  const allowedAmenities = await Promise.all(
    value.listings.map(async (listing) => {
      const wanted = Object.keys(AMENITY_KIND_BY_PAYLOAD_KEY).some((key) => listing.amenities[key].length);
      if (!wanted) return new Set();

      const rows = await writeRepository.findAllowedAmenities({
        listingType,
        propertyType,
        subType: listing.propertySubType,
      });
      return new Set(rows.map((row) => `${row.kind}:${row.amenity_key}`));
    })
  );

  value.listings.forEach((listing, index) => {
    const prefix = `listings.${index}`;

    if (!subTypes.has(listing.propertySubType)) {
      fields[`${prefix}.propertySubType`] = "Invalid property sub type";
    }
    for (const [key, optionKeys] of Object.entries(listing.selections)) {
      const invalid = optionKeys.find((optionKey) => !optionIds.has(`${OPTION_GROUPS[key]}:${optionKey}`));
      if (invalid) fields[`${prefix}.selections.${key}`] = `Invalid option: ${invalid}`;
    }
    for (const [key, kind] of Object.entries(AMENITY_KIND_BY_PAYLOAD_KEY)) {
      const invalid = listing.amenities[key].find(
        (amenityKey) => !allowedAmenities[index].has(`${kind}:${amenityKey}`)
      );
      if (invalid) fields[`${prefix}.amenities.${key}`] = `Invalid ${kind}: ${invalid}`;
    }
  });

  return { subTypes, optionIds };
}

// Columns an edit may change; ownership, type and status columns are not part of it
function buildPropertyColumns({ value, listing, rule, subTypeRow }) {
  const { address, listingType } = value;

  return {
    ...nullColumns(NULLABLE_PROPERTY_COLUMNS),
    title: derive.deriveTitle({
      rule,
      subTypeName: subTypeRow.name,
      listing,
      locality: address.locality,
      projectName: value.project?.projectName,
    }),
    price: derive.derivePrice(listingType, listing),
    area_sqft: derive.deriveAreaSqft(rule, listing),
    ...toRow({
      projectName: address.projectName,
      blockNo: address.blockNo,
      flatNumber: address.flatNumber,
      locality: address.locality,
      addressLine2: address.addressLine2,
      landmark: address.landmark,
      pinCode: address.pinCode,
      city: address.city,
      state: address.state,
      description: listing.description,
      facing: listing.facing,
      availableFrom: listing.availableFrom,
      constructionStatus: listing.construction.status,
      possessionDate: listing.construction.possessionDate,
    }),
  };
}

function buildPropertyRow({ id, user, value, listing, rule, subTypeRow, projectId, groupId }) {
  return {
    id,
    ...toOwnerColumns(user),
    listed_by: user.role,
    listing_type: value.listingType,
    property_type: PROPERTY_TYPE_TO_DB[value.propertyType],
    property_sub_type_id: subTypeRow.id,
    builder_project_id: projectId ?? null,
    listing_group_id: groupId ?? null,
    status: "draft",
    ...buildPropertyColumns({ value, listing, rule, subTypeRow }),
  };
}

function buildProjectColumns(project) {
  const { highlights, primeLocations, faqs, ...columns } = project;
  return { ...nullColumns(NULLABLE_PROJECT_COLUMNS), ...toRow(columns) };
}

async function insertProjectChildren(trx, projectId, { highlights, primeLocations, faqs }) {
  await writeRepository.insertBuilderHighlights(trx, [
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
  await writeRepository.insertBuilderFaqs(
    trx,
    faqs.map((item, index) => ({
      builder_project_id: projectId,
      question: item.question,
      answer: item.answer,
      sort_order: index,
    }))
  );
}

async function insertProject(trx, user, project) {
  const projectId = crypto.randomUUID();

  await writeRepository.insertBuilderProject(trx, {
    id: projectId,
    ...toOwnerColumns(user),
    ...buildProjectColumns(project),
  });
  await insertProjectChildren(trx, projectId, project);

  return projectId;
}

async function replaceProject(trx, projectId, project) {
  await writeRepository.updateBuilderProject(trx, projectId, buildProjectColumns(project));
  await writeRepository.deleteProjectChildren(trx, projectId);
  await insertProjectChildren(trx, projectId, project);
}

async function insertVariants(trx, { propertyId, dbType, rule, subTypeRow, variants }) {
  const rows = variants.map((variant) => ({ ...variant, id: crypto.randomUUID() }));

  await writeRepository.insertVariants(
    trx,
    rows.map(({ id, label, size, sizeUnit, price, unitsAvailable }, index) => ({
      id,
      property_id: propertyId,
      property_type: dbType,
      property_sub_type_id: subTypeRow.id,
      sort_order: index,
      ...toRow({ label, size, sizeUnit, price, unitsAvailable }),
    }))
  );
  await writeRepository.insertVariantTypeRows(
    trx,
    rule.typeTable,
    rows.map(({ id, details }) => ({ variant_id: id, ...toRow(details) }))
  );
  await writeRepository.insertVariantCharges(
    trx,
    rows.filter(({ charges }) => hasKeys(charges)).map(({ id, charges }) => ({ variant_id: id, ...toRow(charges) }))
  );
}

// Everything that hangs off the property row except files and status history
async function insertListingDetails(trx, { value, lookups }, listing, propertyId) {
  const rule = getRule(value.propertyType, listing.propertySubType);
  const subTypeRow = lookups.subTypes.get(listing.propertySubType);
  const dbType = PROPERTY_TYPE_TO_DB[value.propertyType];

  await writeRepository.insertTypeRow(trx, rule.typeTable, { property_id: propertyId, ...toRow(listing.details) });
  if (hasKeys(listing.plotDetails)) {
    await writeRepository.insertPlotDetails(trx, { property_id: propertyId, ...toRow(listing.plotDetails) });
  }

  const pricingRow = { property_id: propertyId, ...toRow(listing.pricing) };
  if (value.listingType === "sale") {
    await writeRepository.insertSaleDetails(trx, pricingRow);
  } else {
    await writeRepository.insertRentDetails(trx, pricingRow);
  }

  await writeRepository.insertSelections(
    trx,
    Object.entries(listing.selections).flatMap(([key, optionKeys]) =>
      optionKeys.map((optionKey) => ({
        property_id: propertyId,
        option_id: lookups.optionIds.get(`${OPTION_GROUPS[key]}:${optionKey}`),
      }))
    )
  );
  await writeRepository.insertAmenities(
    trx,
    Object.entries(AMENITY_KIND_BY_PAYLOAD_KEY).flatMap(([key, kind]) =>
      listing.amenities[key].map((amenityKey) => ({ property_id: propertyId, kind, amenity_key: amenityKey }))
    )
  );

  if (listing.variants) {
    await insertVariants(trx, { propertyId, dbType, rule, subTypeRow, variants: listing.variants });
    await writeRepository.insertBuilderListingDetails(trx, {
      property_id: propertyId,
      ...toRow({ ...derive.deriveVariantPriceRange(listing.variants), ...listing.builder.listing }),
    });
    await writeRepository.insertSpecifications(
      trx,
      listing.builder.specifications.map((item, position) => ({
        property_id: propertyId,
        ...toRow(item),
        sort_order: position,
      }))
    );
  }
}

module.exports = {
  resolveLookups,
  buildPropertyRow,
  buildPropertyColumns,
  insertProject,
  replaceProject,
  insertListingDetails,
};
