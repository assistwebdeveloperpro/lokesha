const fs = require("fs");
const path = require("path");
const { db } = require("../../../config/db");
const repository = require("./property.repository");
const { MAX_MEDIA_FILES } = require("./property.constants");

const BACKEND_ROOT = path.join(__dirname, "../../../..");
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

function assertValidId(...ids) {
  if (ids.some((id) => !UUID_PATTERN.test(id))) {
    throw new AppError("Property not found", 404);
  }
}

// Remove stored files by their /uploads/... paths; failures are logged only
async function removeStoredFiles(filePaths) {
  await Promise.all(
    filePaths.filter(Boolean).map(async (filePath) => {
      try {
        await fs.promises.unlink(path.join(BACKEND_ROOT, filePath));
      } catch (error) {
        if (error.code !== "ENOENT") console.error("Failed to remove file:", filePath, error.message);
      }
    })
  );
}

function toNumber(value) {
  return value === null || value === undefined ? null : Number(value);
}

function formatPossessionDate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  }
  const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

function toColumns(body) {
  const { address, details, amenities, pricing } = body;
  const parkingAvailable = Boolean(amenities.carParkingAvailable);

  return {
    listing_type: body.listingType,
    property_type: body.propertyType,
    property_sub_type: body.propertySubType || null,
    block_no: address.blockNo || null,
    flat_number: address.flatNumber || null,
    project_name: address.projectName,
    locality: address.locality,
    address_line_2: address.addressLine2 || null,
    landmark: address.landmark || null,
    pin_code: address.pinCode,
    city: address.city || null,
    state: address.state,
    description: address.propertyDescription,
    carpet_area: details.carpetArea,
    carpet_area_unit: details.carpetAreaUnit,
    super_build_up_area: details.superBuildUpArea ?? null,
    super_build_up_unit: details.superBuildUpUnit,
    property_transaction: details.propertyTransaction || null,
    construction_status: details.constructionStatus || null,
    possession_date: details.possessionDate || null,
    age_of_construction: details.ageOfConstruction || null,
    full_house: Boolean(details.fullHouse),
    sharing_basis: Boolean(details.sharingBasis),
    available_from: details.availableFrom || null,
    interior_modification_allowed: Boolean(details.interiorModificationAllowed),
    tenant_preferences: details.tenantPreferences || [],
    bedrooms: details.bedrooms,
    balconies: details.balconies,
    bathrooms: details.bathrooms,
    lift_count: details.lift ?? null,
    total_floors: details.totalFloors,
    floor_number: details.floorNumber,
    furnishing_status: amenities.furnishingStatus || null,
    facing: amenities.facing || null,
    car_parking_available: parkingAvailable,
    car_parking_count: parkingAvailable ? amenities.carParking : null,
    club_membership: Boolean(amenities.clubMembership),
    rera_number: amenities.reraNumber || null,
    open_sides: amenities.openSides ?? null,
    expected_price: pricing.expectedPrice ?? null,
    price_negotiable: Boolean(pricing.priceNegotiable),
    price_inclusions: pricing.priceInclusion || [],
    booking_amount: pricing.bookingAmount ?? null,
    transfer_fee: pricing.transferFee ?? null,
    monthly_rent: pricing.monthlyRent ?? null,
    notice_period_months: pricing.noticePeriod ?? null,
    deposit_amount: pricing.depositAmount ?? null,
    maintenance_charges: pricing.maintenanceCharges ?? null,
    benefits_remarks: pricing.benefitsRemarks || null,
  };
}

function toMediaDto(media) {
  return {
    id: media.id,
    category: media.category,
    mediaType: media.media_type,
    filePath: media.file_path,
    originalName: media.original_name,
    sortOrder: media.sort_order,
  };
}

function toSummaryDto(row) {
  return {
    id: row.id,
    status: row.status,
    listingType: row.listing_type,
    propertyType: row.property_type,
    propertySubType: row.property_sub_type,
    projectName: row.project_name,
    locality: row.locality,
    city: row.city,
    state: row.state,
    carpetArea: toNumber(row.carpet_area),
    carpetAreaUnit: row.carpet_area_unit,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    expectedPrice: toNumber(row.expected_price),
    monthlyRent: toNumber(row.monthly_rent),
    mainImage: row.main_image,
    createdAt: row.created_at,
  };
}

function toDetailDto(row, amenityRows, mediaRows) {
  const keysOf = (kind) =>
    amenityRows.filter((item) => item.kind === kind).map((item) => item.amenity_key);

  return {
    id: row.id,
    status: row.status,
    ownerName: row.owner_name,
    listingType: row.listing_type,
    propertyType: row.property_type,
    propertySubType: row.property_sub_type,
    address: {
      blockNo: row.block_no,
      flatNumber: row.flat_number,
      projectName: row.project_name,
      locality: row.locality,
      addressLine2: row.address_line_2,
      landmark: row.landmark,
      pinCode: row.pin_code,
      city: row.city,
      state: row.state,
      propertyDescription: row.description,
    },
    details: {
      carpetArea: toNumber(row.carpet_area),
      carpetAreaUnit: row.carpet_area_unit,
      superBuildUpArea: toNumber(row.super_build_up_area),
      superBuildUpUnit: row.super_build_up_unit,
      propertyTransaction: row.property_transaction,
      constructionStatus: row.construction_status,
      possessionDate: formatPossessionDate(row.possession_date),
      ageOfConstruction: row.age_of_construction,
      fullHouse: row.full_house,
      sharingBasis: row.sharing_basis,
      availableFrom: formatPossessionDate(row.available_from),
      interiorModificationAllowed: row.interior_modification_allowed,
      tenantPreferences: row.tenant_preferences,
      bedrooms: row.bedrooms,
      balconies: row.balconies,
      totalFloors: row.total_floors,
      floorNumber: row.floor_number,
      bathrooms: row.bathrooms,
      lift: row.lift_count,
    },
    amenities: {
      furnishingStatus: row.furnishing_status,
      furnishing: keysOf("furnishing"),
      amenities: keysOf("amenity"),
      facing: row.facing,
      carParkingAvailable: row.car_parking_available,
      carParking: row.car_parking_count,
      clubMembership: row.club_membership,
      reraNumber: row.rera_number,
      openSides: row.open_sides,
    },
    pricing: {
      expectedPrice: toNumber(row.expected_price),
      priceInclusion: row.price_inclusions,
      priceNegotiable: row.price_negotiable,
      transferFee: toNumber(row.transfer_fee),
      bookingAmount: toNumber(row.booking_amount),
      monthlyRent: toNumber(row.monthly_rent),
      noticePeriod: row.notice_period_months,
      depositAmount: toNumber(row.deposit_amount),
      maintenanceCharges: toNumber(row.maintenance_charges),
      benefitsRemarks: row.benefits_remarks,
    },
    brochurePath: row.brochure_path,
    media: mediaRows.map(toMediaDto),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function buildDetail(row, trx) {
  const [amenityRows, mediaRows] = await Promise.all([
    repository.findAmenitiesByPropertyId(row.id, trx),
    repository.findMediaByPropertyId(row.id, trx),
  ]);
  return toDetailDto(row, amenityRows, mediaRows);
}

function toMediaRows(files, categories, startOrder) {
  return files.map((file, index) => {
    const isHeic = path.extname(file.originalname).toLowerCase() === ".heic";
    const mimeType = file.mimetype && file.mimetype !== "application/octet-stream"
      ? file.mimetype
      : isHeic ? "image/heic" : file.mimetype;

    return {
      category: categories[index],
      media_type: mimeType === "video/mp4" ? "video" : "image",
      file_path: `/uploads/property-media/${file.filename}`,
      original_name: file.originalname.slice(0, 255),
      mime_type: mimeType,
      file_size: file.size,
      sort_order: startOrder + index,
    };
  });
}

function assertCategoriesMatch(files, categories) {
  if (categories.length !== files.length) {
    throw new AppError("Each uploaded file needs a media category", 400);
  }
}

async function createPropertyForOwner(owner, body, files) {
  const mediaFiles = files?.media || [];
  const brochure = files?.brochure?.[0];
  const mediaRows = toMediaRows(mediaFiles, body.mediaCategories, 0);

  assertCategoriesMatch(mediaFiles, body.mediaCategories);
  if (!mediaRows.some((row) => row.media_type === "image")) {
    throw new AppError("At least one photo is required", 400);
  }

  const columns = {
    ...toColumns(body),
    brochure_path: brochure ? `/uploads/property-brochures/${brochure.filename}` : null,
  };

  return db.transaction(async (trx) => {
    const property = await repository.createProperty(owner, columns, trx);
    await repository.insertAmenities(property.id, "amenity", body.amenities.amenities, trx);
    await repository.insertAmenities(property.id, "furnishing", body.amenities.furnishing, trx);
    await repository.insertMedia(property.id, mediaRows, trx);
    return buildDetail(property, trx);
  });
}

function createProperty(userId, body, files) {
  return createPropertyForOwner({ user_id: userId }, body, files);
}

function pagination(query) {
  return { limit: query.limit, offset: (query.page - 1) * query.limit };
}

async function listPublished(query) {
  const { limit, offset } = pagination(query);
  const { rows, total } = await repository.findPublished({ ...query, limit, offset });
  return { properties: rows.map(toSummaryDto), page: query.page, limit, total };
}

async function listMine(userId, query) {
  const { limit, offset } = pagination(query);
  const { rows, total } = await repository.findAllByUser(userId, { status: query.status, limit, offset });
  return { properties: rows.map(toSummaryDto), page: query.page, limit, total };
}

async function getProperty(id, userId) {
  assertValidId(id);

  const property = await repository.findByIdVisibleTo(id, userId);
  if (!property) throw new AppError("Property not found", 404);

  return buildDetail(property);
}

async function updateProperty(id, userId, body) {
  assertValidId(id);

  return db.transaction(async (trx) => {
    const property = await repository.updateProperty(id, userId, toColumns(body), trx);
    if (!property) throw new AppError("Property not found", 404);

    await repository.replaceAmenities(id, body.amenities.amenities, body.amenities.furnishing, trx);
    return buildDetail(property, trx);
  });
}

async function addMedia(id, userId, body, files) {
  assertValidId(id);

  const mediaFiles = files?.media || [];
  const brochure = files?.brochure?.[0];
  if (!mediaFiles.length && !brochure) {
    throw new AppError("Please upload at least one file", 400);
  }
  assertCategoriesMatch(mediaFiles, body.mediaCategories);

  let oldBrochurePath = null;

  const detail = await db.transaction(async (trx) => {
    const property = await repository.findByIdForUser(id, userId, trx);
    if (!property) throw new AppError("Property not found", 404);

    const existingCount = await repository.countMedia(id, trx);
    if (existingCount + mediaFiles.length > MAX_MEDIA_FILES) {
      throw new AppError(`A property can have at most ${MAX_MEDIA_FILES} photos and videos`, 400);
    }

    const startOrder = await repository.findNextSortOrder(id, trx);
    await repository.insertMedia(id, toMediaRows(mediaFiles, body.mediaCategories, startOrder), trx);

    if (brochure) {
      oldBrochurePath = property.brochure_path;
      await repository.updateBrochurePath(id, `/uploads/property-brochures/${brochure.filename}`, trx);
    }

    const updated = await repository.findByIdForUser(id, userId, trx);
    return buildDetail(updated, trx);
  });

  await removeStoredFiles([oldBrochurePath]);
  return detail;
}

async function deleteMedia(id, mediaId, userId) {
  assertValidId(id, mediaId);

  const media = await db.transaction(async (trx) => {
    const property = await repository.findByIdForUser(id, userId, trx);
    if (!property) throw new AppError("Property not found", 404);

    const found = await repository.findMediaByIdForProperty(mediaId, id, trx);
    if (!found) throw new AppError("Media not found", 404);

    await repository.deleteMedia(mediaId, trx);
    return found;
  });

  await removeStoredFiles([media.file_path]);
}

async function deleteProperty(id, userId) {
  assertValidId(id);

  const filePaths = await db.transaction(async (trx) => {
    const property = await repository.findByIdForUser(id, userId, trx);
    if (!property) throw new AppError("Property not found", 404);

    const mediaRows = await repository.findMediaByPropertyId(id, trx);
    await repository.deleteProperty(id, userId, trx);
    return [...mediaRows.map((media) => media.file_path), property.brochure_path];
  });

  await removeStoredFiles(filePaths);
}

module.exports = {
  createProperty,
  listPublished,
  listMine,
  getProperty,
  updateProperty,
  addMedia,
  deleteMedia,
  deleteProperty,
  AppError,
};
