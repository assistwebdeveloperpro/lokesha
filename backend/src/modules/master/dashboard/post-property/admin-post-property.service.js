const fs = require("fs");
const path = require("path");
const { db } = require("../../../../config/db");
const propertyRepository = require("../../../landing/property/property.repository");
const { AppError } = require("../../../landing/property/property.service");
const repository = require("./admin-post-property.repository");

const BACKEND_ROOT = path.join(__dirname, "../../../../..");

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

function toMediaRows(files, categories) {
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
      sort_order: index,
    };
  });
}

function toFloorPlanRows(files, labels) {
  return files.map((file, index) => {
    const isHeic = path.extname(file.originalname).toLowerCase() === ".heic";
    const mimeType = file.mimetype && file.mimetype !== "application/octet-stream"
      ? file.mimetype
      : isHeic ? "image/heic" : file.mimetype;

    return {
      label: labels[index] || null,
      file_path: `/uploads/property-floor-plans/${file.filename}`,
      original_name: file.originalname.slice(0, 255),
      mime_type: mimeType,
      file_size: file.size,
      sort_order: index,
    };
  });
}

function toProjectColumns(project) {
  return {
    developer_name: project.developerName || null,
    launch_date: project.launchDate || null,
    total_units: project.totalUnits ?? null,
    total_blocks: project.totalBlocks ?? null,
    project_area: project.projectArea ?? null,
    open_space_percent: project.openSpacePercent ?? null,
    carpet_area_max: project.carpetAreaMax ?? null,
    super_build_up_max: project.superBuildUpMax ?? null,
    price_min: project.priceMin ?? null,
    price_max: project.priceMax ?? null,
    price_per_sqft: project.pricePerSqft ?? null,
    payment_plan: project.paymentPlan || null,
    approved_banks: project.approvedBanks || null,
    video_link: project.videoLink || null,
    configurations: JSON.stringify(project.configurations),
    available_sizes: JSON.stringify(project.availableSizes),
    prime_location_highlights: JSON.stringify(project.primeLocationHighlights),
    project_highlights: JSON.stringify(project.projectHighlights),
    faqs: JSON.stringify(project.faqs),
  };
}

function toNumber(value) {
  return value === null || value === undefined ? null : Number(value);
}

function toProjectDto(row) {
  return {
    developerName: row.developer_name,
    launchDate: row.launch_date,
    totalUnits: row.total_units,
    totalBlocks: row.total_blocks,
    projectArea: toNumber(row.project_area),
    openSpacePercent: toNumber(row.open_space_percent),
    carpetAreaMax: toNumber(row.carpet_area_max),
    superBuildUpMax: toNumber(row.super_build_up_max),
    priceMin: toNumber(row.price_min),
    priceMax: toNumber(row.price_max),
    pricePerSqft: toNumber(row.price_per_sqft),
    paymentPlan: row.payment_plan,
    approvedBanks: row.approved_banks,
    videoLink: row.video_link,
    configurations: row.configurations,
    availableSizes: row.available_sizes,
    primeLocationHighlights: row.prime_location_highlights,
    projectHighlights: row.project_highlights,
    faqs: row.faqs,
  };
}

function toResponseDto(property, mediaRows, projectRow, floorPlanRows) {
  return {
    id: property.id,
    adminId: property.admin_id,
    status: property.status,
    listingType: property.listing_type,
    propertyType: property.property_type,
    propertySubType: property.property_sub_type,
    projectName: property.project_name,
    locality: property.locality,
    city: property.city,
    state: property.state,
    brochurePath: property.brochure_path,
    media: mediaRows.map((media) => ({
      id: media.id,
      category: media.category,
      mediaType: media.media_type,
      filePath: media.file_path,
      sortOrder: media.sort_order,
    })),
    projectDetails: toProjectDto(projectRow),
    floorPlans: floorPlanRows.map((plan) => ({
      id: plan.id,
      label: plan.label,
      filePath: plan.file_path,
      sortOrder: plan.sort_order,
    })),
    createdAt: property.created_at,
  };
}

async function createProperty(adminId, body, files) {
  const mediaFiles = files?.media || [];
  const floorPlanFiles = files?.floorPlans || [];
  const brochure = files?.brochure?.[0];

  if (body.mediaCategories.length !== mediaFiles.length) {
    throw new AppError("Each uploaded file needs a media category", 400);
  }
  if (body.floorPlanLabels.length !== floorPlanFiles.length) {
    throw new AppError("Each floor plan needs a label", 400);
  }

  const mediaRows = toMediaRows(mediaFiles, body.mediaCategories);
  if (!mediaRows.some((row) => row.media_type === "image")) {
    throw new AppError("At least one photo is required", 400);
  }

  const columns = {
    ...toColumns(body),
    status: "published",
    brochure_path: brochure ? `/uploads/property-brochures/${brochure.filename}` : null,
  };

  return db.transaction(async (trx) => {
    const property = await propertyRepository.createProperty({ admin_id: adminId }, columns, trx);
    await propertyRepository.insertAmenities(property.id, "amenity", body.amenities.amenities, trx);
    await propertyRepository.insertAmenities(property.id, "furnishing", body.amenities.furnishing, trx);
    const savedMedia = await propertyRepository.insertMedia(property.id, mediaRows, trx);
    const projectRow = await repository.insertProjectDetails(
      property.id,
      toProjectColumns(body.projectDetails),
      trx
    );
    const savedPlans = await repository.insertFloorPlans(
      property.id,
      toFloorPlanRows(floorPlanFiles, body.floorPlanLabels),
      trx
    );
    return toResponseDto(property, savedMedia, projectRow, savedPlans);
  });
}

// Deletes the admin, its properties (FK cascade) and every uploaded file they own
async function deleteAdmin(adminId) {
  const filePaths = await db.transaction(async (trx) => {
    const paths = await repository.findFilePathsByAdminId(adminId, trx);
    const deleted = await repository.deleteAdmin(adminId, trx);
    if (!deleted) throw new AppError("Admin not found", 404);
    return paths;
  });

  await removeStoredFiles(filePaths);
}

module.exports = { createProperty, deleteAdmin };
